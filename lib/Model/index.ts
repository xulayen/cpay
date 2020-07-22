import { Util, RedisClient } from '../Util';
import * as cPay_Config from '../Config';
import { WxPayException } from '../Exception/wxPayException';
var xml2js = require("xml2js");
var cryptojs = require("crypto-js");
var MD5 = require('crypto-js/md5');
const crypto = require("crypto");
const iconv = require('iconv-lite');
const fs = require('fs');

export class OrderInfo {
    constructor(body?: string, detail?: string, attach?: string, goods_tag?: string, total_fee?: number) {
        this.body = body;
        this.detail = detail;
        this.attach = attach;
        this.goods_tag = goods_tag;
        this.total_fee = total_fee;
    }
    /**
     * 商品描述
     */
    body: string;

    /**
     * 商品详情
     */
    detail: string;

    /**
     * 附加数据
     */
    attach: string;

    /**
     * 商品标记
     */
    goods_tag: string;

    /**
     * 总金额，订单总金额，单位为分，详见支付金额
     */
    total_fee: number;
}

export class RedisConfig {
    constructor(host: string, port: string, db: number, auth?: string) {
        Util.redisClient = new RedisClient(host, port, db, auth)
    }
}


const Config = cPay_Config.Config;

export class WxPayData {
    public static SIGN_TYPE_MD5: string = "MD5";
    public static SIGN_TYPE_HMAC_SHA256: string = "HMAC-SHA256";
    public static SIGN_TYPE_RSA2: string = "RSA-SHA256";
    public m_values = new Map();

    constructor() { }

    SetValue(key: any, value: any) {
        this.m_values.set(key, value);
    }

    GetValue(key: any) {
        if (this.IsSet(key))
            return this.m_values.get(key);
        return "";
    }

    IsSet(key: any) {
        return this.m_values.has(key);
    }

    CheckSign(signType: string): boolean {
        //如果没有设置签名，则跳过检测
        if (!this.IsSet("sign")) {
            throw new WxPayException("WxPayData签名存在但不合法!");
        }
        //如果设置了签名但是签名为空，则抛异常
        else if (this.GetValue("sign") == null || this.GetValue("sign").toString() == "") {
            throw new WxPayException("WxPayData签名存在但不合法!");
        }

        //获取接收到的签名
        let return_sign = this.GetValue("sign").toString();

        //在本地计算新的签名
        let cal_sign = this.MakeSign(signType);

        if (cal_sign == return_sign) {
            return true;
        }

        throw new WxPayException("WxPayData签名验证错误!");
    }

    ToXml() {
        if (this.m_values.size === 0) {
            throw new Error("WxPayData数据为空!");
        }

        let xml = "<xml>";
        this.m_values.forEach(function (value, key) {
            if (value == null) {
                throw new Error(`WxPayData内部含有值为null的字段:${key}!`);
            }

            if (!isNaN(value)) {
                xml += "<" + key + ">" + value + "</" + key + ">";
            }
            else if (Object.prototype.toString.call(value) == "[object String]") {
                xml += "<" + key + ">" + "<![CDATA[" + value + "]]></" + key + ">";
            }
            else//除了string和int类型不能含有其他数据类型
            {
                throw new Error("WxPayData字段数据类型错误!");
            }
        });
        xml += "</xml>";
        return xml;
    }


    async FromXml(xml: any) {
        let xmlNode;
        if (!xml) {
            throw new Error("将空的xml串转换为WxPayData不合法!");
        }

        if (Util.IsString(xml)) {
            xmlNode = await xml2js.parseStringPromise(xml);
        } else if (Util.IsObject(xml)) {
            xmlNode = xml;
        }


        for (let key in xmlNode.xml) {
            //获取xml的键值对到WxPayData内部的数据中
            let value = xmlNode.xml[key].join('');
            this.m_values.set(key, value);
        }

        return this.m_values;

    }

    MakeSign(signType: string = WxPayData.SIGN_TYPE_HMAC_SHA256): any {
        //转url格式
        let str = this.ToUrl();
        //在string后加入API KEY
        str += "&key=" + Config.GetWxPayConfig().GetKey();
        if (signType === WxPayData.SIGN_TYPE_MD5) {
            return this.md5(str);
        }
        else if (signType === WxPayData.SIGN_TYPE_HMAC_SHA256) {

            return this.CalcHMACSHA256Hash(str, Config.GetWxPayConfig().GetKey());

        } else if (signType === WxPayData.SIGN_TYPE_RSA2) {

            let privateKey = Config.GetAlipayConfig().GetPrivateKey();
            let sign = crypto.createSign(WxPayData.SIGN_TYPE_RSA2).update(this.AliSignStr(), "utf8").sign(privateKey, 'base64');
            console.log('商户生成的签名：');
            console.log(sign);
            return sign;
        } else {
            throw new Error("sign_type 不合法");
        }
    }

    AliSignStr() {
        let af = Array.from(this.m_values), m = new Map(af.sort());
        let decamelizeParams = Object.create(null);
        for (let [k, v] of m) {
            decamelizeParams[k] = v;
        }

        // 排序
        const signStr = Object.keys(decamelizeParams).sort().map((key) => {
            let data = decamelizeParams[key];
            if (Array.prototype.toString.call(data) !== '[object String]') {
                data = JSON.stringify(data);
            }
            return `${key}=${iconv.encode(data, 'utf8')}`;

            //}).join('&amp;').replace(/\"/ig, "&quot;");
        }).join('&');

        console.log('商户签名：');
        console.log(signStr);



        return signStr;
    }

    ToUrl() {
        let buff = '', array_values = Array.from(this.m_values), i = 0;
        this.m_values = new Map(array_values.sort());

        this.m_values.forEach(function (value, key) {
            i++;
            if (!value) {
                throw new Error(`WxPayData内部含有值为null的字段:${key}!`);
            }
            if (key != "sign" && value != "") {
                buff += key + "=" + value + "&";
            }

        });

        buff = buff.trim().substr(0, buff.length - 1);

        return buff;
    }

    ToUrl_Ali() {
        let buff = '', array_values = Array.from(this.m_values), i = 0;
        this.m_values = new Map(array_values.sort());

        this.m_values.forEach(function (value, key) {
            i++;
            if (!value) {
                throw new Error(`WxPayData内部含有值为null的字段:${key}!`);
            }
            if (value != "") {
                buff += key + "=" + encodeURIComponent(value) + "&";
            }

        });

        buff = buff.trim().substr(0, buff.length - 1);

        return buff;
    }

    ToJson() {
        let obj = Object.create(null);
        this.m_values.forEach(function (value, key) {
            obj[key] = value;
        })
        return obj;
    }


    CalcHMACSHA256Hash(plaintext: string, salt: string) {
        let pass = cryptojs.HmacSHA256(plaintext, salt);
        var hashInBase64 = cryptojs.enc.Base64.stringify(pass);
        console.log(plaintext, salt, pass.toString().toLocaleUpperCase());
        let pass_uppercase = pass.toString().toLocaleUpperCase();
        return pass_uppercase;
    }

    SHA1(plaintext?: string) {
        if (!plaintext) {
            plaintext = this.ToUrl();
        }
        return cryptojs.SHA1(plaintext).toString();
    }

    GetValues() {
        return this.m_values;
    }


    md5(plaintext: string) {
        return MD5(plaintext).toString();
    }
}


export class ResponseData {
    constructor() {

    }

    data: WxPayData;
    return_code: string;
    result_code: string;
    err_code: string;
    msg: string;
}

export class AlipayConfig {
    constructor() {
        this.AppID = "";
        this.PrivateKey = "";
        this.AesKey="";
        this.Notify_url="";
    }
    public AppID:string;
    public PrivateKey:string;
    public AesKey:string;
    public Notify_url:string;


}

export class WeixinConfig {
    constructor() {
        this.Facid = "";
        this.AppID = "";
        this.MchID = "";
        this.Key = "";
        this.AppSecret = "";
        this.SSlCertPath = "";
        this.SSlCertPassword = "";
        this.NotifyUrl = "";
        this.Ip = "";
        this.ProxyUrl = "";
        this.ReportLevel = "";
        this.LogLevel = "";
        this.Redirect_uri = "";
        this.OpenAppid = "";
        this.OpenAppsecret = "";
        this.OpenAesKey = "";
    }
    Facid: string;
    AppID: string;
    MchID: string;
    Key: string;
    AppSecret: string;
    SSlCertPath: string;
    SSlCertPassword: string;
    NotifyUrl: string;
    Ip: string;
    ProxyUrl: string;
    ReportLevel: string;
    LogLevel: string;
    Redirect_uri: string;
    OpenAppid: string;
    OpenAppsecret: string;
    OpenAesKey: string;
}

/**
 * h5场景信息
 */
export class SceneInfo {
    /**
     * 场景类型
     */
    type: string;

    /**
     * WAP网站URL地址
     */
    wap_url: string;

    /**
     * WAP 网站名
     */
    wap_name: string;

    constructor(type: string, wap_url: string, wap_name: string) {
        this.type = type;
        this.wap_url = wap_url;
        this.wap_name = wap_name;

    }
}

export class WeixinUserInfo {
    constructor() {

    }
    public openid: string;
    public nickname: string;
    public sex: string;
    public province: string;
    public city: string;
    public country: string;
    public headimgurl: string;
    public privilege: string[];
    public unionid: string;
}


export enum RedPackSceneEnum {

    /**
     * 商品促销
     */
    Promotion = "PRODUCT_1",

    /**
     * 抽奖
     */
    Draw = "PRODUCT_2",


    /**
     * 虚拟物品兑奖
     */
    VirtualGoodsCash = "PRODUCT_3",


    /**
     * 企业内部福利
     */
    InternalWelfareOfEnterprises = "PRODUCT_4",


    /**
     * 渠道分润
     */
    ChannelShare = "PRODUCT_5",


    /**
     * 保险回馈
     */
    InsuranceFeedback = "PRODUCT_6",


    /**
     * 彩票派奖
     */
    LotteryPrize = "PRODUCT_7",


    /**
     * 税务刮奖
     */
    TaxPrize = "PRODUCT_8"

}

export class RedPackInfo {
    constructor() {

    }

    /**
     * 发送方
     * @type {string}
     * @memberof RedPackInfo
     */
    public send_name: string;

    /**
     * openid
     *
     * @type {string}
     * @memberof RedPackInfo
     */
    public openid: string;

    /**
     * 金额，单位：分
     *
     * @type {number}
     * @memberof RedPackInfo
     */
    public total_amount: number;

    /**
     * 总数量
     *
     * @type {number}
     * @memberof RedPackInfo
     */
    public total_num: number;

    /**
     * 祝福语
     *
     * @type {string}
     * @memberof RedPackInfo
     */
    public wishing: string;

    /**
     * 活动名称
     *
     * @type {string}
     * @memberof RedPackInfo
     */
    public act_name: string;

    /**
     * 备注
     *
     * @type {string}
     * @memberof RedPackInfo
     */
    public remark: string;

    /**
     * 
     * 场景信息
     * @type {RedPackSceneEnum}
     * @memberof RedPackInfo
     */
    public scene_id: RedPackSceneEnum;
}


