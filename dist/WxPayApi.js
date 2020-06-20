"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WxPayApi = exports.WxPayData = void 0;
const cPay_Config = require("./Config");
const cPay_Util = require("./Util");
const date_fns_1 = require("date-fns");
const cPay_Exception = require("./Exception/wxPayException");
const constant_1 = require("./Config/constant");
const Util = cPay_Util.Util;
var xml2js = require("xml2js");
var cryptojs = require("crypto-js");
var MD5 = require('crypto-js/md5');
//export namespace cPay {
const WxPayConfig = cPay_Config.Config;
const WxPayException = cPay_Exception.WxPayException;
class WxPayData {
    constructor() {
        this.m_values = new Map();
    }
    SetValue(key, value) {
        this.m_values.set(key, value);
    }
    GetValue(key) {
        return this.m_values.get(key);
    }
    IsSet(key) {
        return this.m_values.has(key);
    }
    ToXml() {
        if (this.m_values.size === 0) {
            throw new Error("WxPayData数据为空!");
        }
        let xml = "<xml>";
        this.m_values.forEach(function (value, key) {
            if (value == null) {
                throw new Error("WxPayData内部含有值为null的字段!");
            }
            if (!isNaN(value)) {
                xml += "<" + key + ">" + value + "</" + key + ">";
            }
            else if (Object.prototype.toString.call(value) == "[object String]") {
                xml += "<" + key + ">" + "<![CDATA[" + value + "]]></" + key + ">";
            }
            else //除了string和int类型不能含有其他数据类型
             {
                throw new Error("WxPayData字段数据类型错误!");
            }
        });
        xml += "</xml>";
        return xml;
    }
    FromXml(xml) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!xml) {
                throw new Error("将空的xml串转换为WxPayData不合法!");
            }
            let xmlNode = yield xml2js.parseStringPromise(xml);
            for (let key in xmlNode.xml) {
                //获取xml的键值对到WxPayData内部的数据中
                let value = xmlNode.xml[key].join('');
                this.m_values.set(key, value);
            }
            return this.m_values;
        });
    }
    MakeSign(signType = WxPayData.SIGN_TYPE_HMAC_SHA256) {
        //转url格式
        let str = this.ToUrl();
        //在string后加入API KEY
        str += "&key=" + WxPayConfig.GetWxPayConfig().GetKey();
        if (signType === WxPayData.SIGN_TYPE_MD5) {
            return this.md5(str, WxPayConfig.GetWxPayConfig().GetKey());
        }
        else if (signType === WxPayData.SIGN_TYPE_HMAC_SHA256) {
            return this.CalcHMACSHA256Hash(str, WxPayConfig.GetWxPayConfig().GetKey());
        }
        else {
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
                throw new Error("WxPayData内部含有值为null的字段!");
            }
            if (key != "sign" && value != "") {
                buff += key + "=" + value;
            }
            if (size !== i) {
                buff += "&";
            }
        });
        buff = buff.trim();
        return buff;
    }
    ToJson() {
        let obj = Object.create(null);
        this.m_values.forEach(function (value, key) {
            obj[key] = value;
        });
        return obj;
    }
    CalcHMACSHA256Hash(plaintext, salt) {
        let pass = cryptojs.HmacSHA256(plaintext, salt);
        var hashInBase64 = cryptojs.enc.Base64.stringify(pass);
        console.log(plaintext, salt, pass.toString().toLocaleUpperCase());
        let pass_uppercase = pass.toString().toLocaleUpperCase();
        return pass_uppercase;
    }
    GetValues() {
        return this.m_values;
    }
    md5(plaintext, salt) {
        return MD5(plaintext + salt);
    }
}
exports.WxPayData = WxPayData;
WxPayData.SIGN_TYPE_MD5 = "MD5";
WxPayData.SIGN_TYPE_HMAC_SHA256 = "HMAC-SHA256";
class WxPayApi {
    static GenerateTimeStamp() {
        return (new Date().getTime() + Math.ceil(Math.random() * 1000)) + "";
    }
    /**
    * 生成随机串，随机串包含字母或数字
    * @return 随机串
    */
    static GenerateNonceStr() {
        return (new Date().getTime() + Math.ceil(Math.random() * 1000)) + "";
    }
    static GenerateOutTradeNo() {
        return `${WxPayConfig.GetWxPayConfig().GetMchID()}${date_fns_1.format(new Date(), 'yyyyMMddHHmmss'), Math.ceil(Math.random() * 1000)}`;
    }
    /**
     *
     * 统一下单
     * @static
     * @param {WxPayData} inputObj
     * @returns {Promise<cPay.WxPayData>}
     * @memberof WxPayApi
     */
    static UnifiedOrder(inputObj) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = constant_1.default.WEIXIN_wxpay_unifiedorder;
            //检测必填参数
            if (!inputObj.IsSet("out_trade_no")) {
                throw new WxPayException("缺少统一支付接口必填参数out_trade_no！");
            }
            else if (!inputObj.IsSet("body")) {
                throw new WxPayException("缺少统一支付接口必填参数body！");
            }
            else if (!inputObj.IsSet("total_fee")) {
                throw new WxPayException("缺少统一支付接口必填参数total_fee！");
            }
            else if (!inputObj.IsSet("trade_type")) {
                throw new WxPayException("缺少统一支付接口必填参数trade_type！");
            }
            //关联参数
            if (inputObj.GetValue("trade_type").toString() == constant_1.default.WEIXIN_trade_type_JSAPI && !inputObj.IsSet("openid")) {
                throw new WxPayException("统一支付接口中，缺少必填参数openid！trade_type为JSAPI时，openid为必填参数！");
            }
            if (inputObj.GetValue("trade_type").toString() == constant_1.default.WEIXIN_trade_type_NATIVE && !inputObj.IsSet("product_id")) {
                throw new WxPayException("统一支付接口中，缺少必填参数product_id！trade_type为JSAPI时，product_id为必填参数！");
            }
            //异步通知url未设置，则使用配置文件中的url
            if (!inputObj.IsSet("notify_url")) {
                inputObj.SetValue("notify_url", WxPayConfig.GetWxPayConfig().GetNotifyUrl()); //异步通知url
            }
            inputObj.SetValue("appid", WxPayConfig.GetWxPayConfig().GetAppID()); //公众账号ID
            inputObj.SetValue("mch_id", WxPayConfig.GetWxPayConfig().GetMchID()); //商户号
            inputObj.SetValue("spbill_create_ip", WxPayConfig.GetWxPayConfig().GetIp()); //终端ip	  	    
            inputObj.SetValue("nonce_str", this.GenerateNonceStr()); //随机字符串
            inputObj.SetValue("sign_type", WxPayData.SIGN_TYPE_HMAC_SHA256); //签名类型
            //签名
            inputObj.SetValue("sign", inputObj.MakeSign());
            let xml = inputObj.ToXml();
            console.log("WxPayApi", "统一下单 request : " + xml);
            let res = yield Util.setMethodWithUri({
                url: url,
                method: 'post',
                data: xml,
                headers: {
                    'content-type': 'text/xml'
                }
            });
            console.log("WxPayApi", "统一下单 response : " + res);
            let result = new WxPayData();
            result.FromXml(res);
            return result;
        });
    }
    /**
     *
     * 查询订单
     * @static
     * @param {WxPayData} inputObj
     * @returns {Promise<cPay.WxPayData>}
     * @memberof WxPayApi
     */
    static OrderQuery(inputObj) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = constant_1.default.WEIXIN_wxpay_orderquery;
            //检测必填参数
            if (!inputObj.IsSet("out_trade_no") && !inputObj.IsSet("transaction_id")) {
                throw new WxPayException("订单查询接口中，out_trade_no、transaction_id至少填一个！");
            }
            inputObj.SetValue("appid", WxPayConfig.GetWxPayConfig().GetAppID()); //公众账号ID
            inputObj.SetValue("mch_id", WxPayConfig.GetWxPayConfig().GetMchID()); //商户号
            inputObj.SetValue("nonce_str", WxPayApi.GenerateNonceStr()); //随机字符串
            inputObj.SetValue("sign_type", WxPayData.SIGN_TYPE_HMAC_SHA256); //签名类型
            inputObj.SetValue("sign", inputObj.MakeSign()); //签名
            let xml = inputObj.ToXml();
            console.log(`查询订单-request: \n${xml}`);
            let res = yield Util.setMethodWithUri({
                url: url,
                method: 'post',
                data: xml,
                headers: {
                    'content-type': 'text/xml'
                }
            });
            console.log(`查询订单-response: \n${res}`);
            //将xml格式的数据转化为对象以返回
            let result = new WxPayData();
            result.FromXml(res);
            return result;
        });
    }
    /**
     * 关闭订单
     * @static
     * @param {WxPayData} inputObj
     * @returns {Promise<cPay.WxPayData>}
     * @memberof WxPayApi
     */
    static CloseOrder(inputObj) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = constant_1.default.WEIXIN_wxpay_closeorder;
            //检测必填参数
            if (!inputObj.IsSet("out_trade_no")) {
                throw new WxPayException("关闭订单接口中，out_trade_no必填！");
            }
            inputObj.SetValue("appid", WxPayConfig.GetWxPayConfig().GetAppID()); //公众账号ID
            inputObj.SetValue("mch_id", WxPayConfig.GetWxPayConfig().GetMchID()); //商户号
            inputObj.SetValue("nonce_str", WxPayApi.GenerateNonceStr()); //随机字符串		
            inputObj.SetValue("sign_type", WxPayData.SIGN_TYPE_HMAC_SHA256); //签名类型
            inputObj.SetValue("sign", inputObj.MakeSign()); //签名
            let xml = inputObj.ToXml();
            console.log(`关闭订单-request: \n${xml}`);
            let res = yield Util.setMethodWithUri({
                url: url,
                method: 'post',
                data: xml,
                headers: {
                    'content-type': 'text/xml'
                }
            });
            console.log(`关闭订单-response: \n${res}`);
            let result = new WxPayData();
            result.FromXml(res);
            return result;
        });
    }
    /**
     * 申请退款
     *
     * @static
     * @param {WxPayData} inputObj
     * @returns {Promise<cPay.WxPayData>}
     * @memberof WxPayApi
     */
    static Refund(inputObj) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = constant_1.default.WEIXIN_wxpay_refund;
            //检测必填参数
            if (!inputObj.IsSet("out_trade_no") && !inputObj.IsSet("transaction_id")) {
                throw new WxPayException("退款申请接口中，out_trade_no、transaction_id至少填一个！");
            }
            else if (!inputObj.IsSet("out_refund_no")) {
                throw new WxPayException("退款申请接口中，缺少必填参数out_refund_no！");
            }
            else if (!inputObj.IsSet("total_fee")) {
                throw new WxPayException("退款申请接口中，缺少必填参数total_fee！");
            }
            else if (!inputObj.IsSet("refund_fee")) {
                throw new WxPayException("退款申请接口中，缺少必填参数refund_fee！");
            }
            else if (!inputObj.IsSet("op_user_id")) {
                throw new WxPayException("退款申请接口中，缺少必填参数op_user_id！");
            }
            inputObj.SetValue("appid", WxPayConfig.GetWxPayConfig().GetAppID()); //公众账号ID
            inputObj.SetValue("mch_id", WxPayConfig.GetWxPayConfig().GetMchID()); //商户号
            inputObj.SetValue("nonce_str", WxPayApi.GenerateNonceStr()); //随机字符串
            inputObj.SetValue("sign_type", WxPayData.SIGN_TYPE_HMAC_SHA256); //签名类型
            inputObj.SetValue("sign", inputObj.MakeSign()); //签名
            let xml = inputObj.ToXml();
            console.log(`申请退款-request: \n${xml}`);
            let res = yield Util.setMethodWithUri({
                url: url,
                method: 'post',
                data: xml,
                headers: {
                    'content-type': 'text/xml'
                },
                cert: WxPayConfig.GetWxPayConfig().GetSSlCertPath(),
                password: WxPayConfig.GetWxPayConfig().GetSSlCertPassword()
            });
            console.log(`申请退款-response: \n${res}`);
            let result = new WxPayData();
            result.FromXml(res);
            return result;
        });
    }
    /**
    * 查询退款
    * @static
    * @param {cPay.WxPayData} inputObj
    * @returns {Promise<cPay.WxPayData>}
    * @memberof WxPayApi
    */
    static RefundQuery(inputObj) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = constant_1.default.WEIXIN_wxpay_refundquery;
            //检测必填参数
            if (!inputObj.IsSet("out_refund_no") && !inputObj.IsSet("out_trade_no") &&
                !inputObj.IsSet("transaction_id") && !inputObj.IsSet("refund_id")) {
                throw new WxPayException("退款查询接口中，out_refund_no、out_trade_no、transaction_id、refund_id四个参数必填一个！");
            }
            inputObj.SetValue("appid", WxPayConfig.GetWxPayConfig().GetAppID()); //公众账号ID
            inputObj.SetValue("mch_id", WxPayConfig.GetWxPayConfig().GetMchID()); //商户号
            inputObj.SetValue("nonce_str", WxPayApi.GenerateNonceStr()); //随机字符串
            inputObj.SetValue("sign_type", WxPayData.SIGN_TYPE_HMAC_SHA256); //签名类型
            inputObj.SetValue("sign", inputObj.MakeSign()); //签名
            let xml = inputObj.ToXml();
            console.log(`查询退款-request: \n${xml}`);
            let res = yield Util.setMethodWithUri({
                url: url,
                method: 'post',
                data: xml,
                headers: {
                    'content-type': 'text/xml'
                }
            });
            console.log(`查询退款-response: \n${res}`);
            let result = new WxPayData();
            result.FromXml(res);
            return result;
        });
    }
    static ShortUrl(inputObj) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = constant_1.default.WEIXIN_wxpay_shorturl;
            //检测必填参数
            if (!inputObj.IsSet("long_url")) {
                throw new WxPayException("需要转换的URL，签名用原串，传输需URL encode！");
            }
            inputObj.SetValue("appid", WxPayConfig.GetWxPayConfig().GetAppID()); //公众账号ID
            inputObj.SetValue("mch_id", WxPayConfig.GetWxPayConfig().GetMchID()); //商户号
            inputObj.SetValue("nonce_str", WxPayApi.GenerateNonceStr()); //随机字符串	
            inputObj.SetValue("sign_type", WxPayData.SIGN_TYPE_HMAC_SHA256); //签名类型
            inputObj.SetValue("sign", inputObj.MakeSign()); //签名
            let xml = inputObj.ToXml();
            console.log(`短链接-request: \n${xml}`);
            let res = yield Util.setMethodWithUri({
                url: url,
                method: 'post',
                data: xml,
                headers: {
                    'content-type': 'text/xml'
                }
            });
            console.log(`短链接-response: \n${res}`);
            let result = new WxPayData();
            result.FromXml(res);
            return result;
        });
    }
}
exports.WxPayApi = WxPayApi;
//}
