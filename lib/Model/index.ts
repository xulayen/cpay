import { Util, RedisClient } from '../Util';
import * as cPay_Config from '../Config';
import { WxPayException } from '../Exception/wxPayException';
var xml2js = require("xml2js");
var cryptojs = require("crypto-js");
var MD5 = require('crypto-js/md5');

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


const WxPayConfig = cPay_Config.Config;

export class WxPayData {
    public static SIGN_TYPE_MD5: string = "MD5";
    public static SIGN_TYPE_HMAC_SHA256: string = "HMAC-SHA256";
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
        str += "&key=" + WxPayConfig.GetWxPayConfig().GetKey();
        if (signType === WxPayData.SIGN_TYPE_MD5) {
            return this.md5(str, WxPayConfig.GetWxPayConfig().GetKey());
        }
        else if (signType === WxPayData.SIGN_TYPE_HMAC_SHA256) {

            return this.CalcHMACSHA256Hash(str, WxPayConfig.GetWxPayConfig().GetKey());

        } else {
            throw new Error("sign_type 不合法");
        }
    }

    ToUrl() {
        let buff = '', array_values = Array.from(this.m_values), i = 0;
        this.m_values = new Map(array_values.sort());
        let size = this.m_values.size;

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

    GetValues() {
        return this.m_values;
    }


    md5(plaintext: string, salt: string) {
        return MD5(plaintext + salt);
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

export class WeixinConfig {

    constructor() {

    }
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
}

export class SceneInfo {
    type: string;
    wap_url: string;
    wap_name: string;

    constructor(type: string, wap_url: string, wap_name: string) {
        this.type = type;
        this.wap_url = wap_url;
        this.wap_name = wap_name;

    }
}
