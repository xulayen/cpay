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
exports.SceneInfo = exports.WeixinConfig = exports.ResponseData = exports.WxPayData = exports.RedisConfig = exports.OrderInfo = void 0;
const Util_1 = require("../Util");
const cPay_Config = require("../Config");
const wxPayException_1 = require("../Exception/wxPayException");
var xml2js = require("xml2js");
var cryptojs = require("crypto-js");
var MD5 = require('crypto-js/md5');
class OrderInfo {
    constructor(body, detail, attach, goods_tag, total_fee) {
        this.body = body;
        this.detail = detail;
        this.attach = attach;
        this.goods_tag = goods_tag;
        this.total_fee = total_fee;
    }
}
exports.OrderInfo = OrderInfo;
class RedisConfig {
    constructor(host, port, db, auth) {
        Util_1.Util.redisClient = new Util_1.RedisClient(host, port, db, auth);
    }
}
exports.RedisConfig = RedisConfig;
const WxPayConfig = cPay_Config.Config;
class WxPayData {
    constructor() {
        this.m_values = new Map();
    }
    SetValue(key, value) {
        this.m_values.set(key, value);
    }
    GetValue(key) {
        if (this.IsSet(key))
            return this.m_values.get(key);
        return "";
    }
    IsSet(key) {
        return this.m_values.has(key);
    }
    CheckSign(signType) {
        //如果没有设置签名，则跳过检测
        if (!this.IsSet("sign")) {
            throw new wxPayException_1.WxPayException("WxPayData签名存在但不合法!");
        }
        //如果设置了签名但是签名为空，则抛异常
        else if (this.GetValue("sign") == null || this.GetValue("sign").toString() == "") {
            throw new wxPayException_1.WxPayException("WxPayData签名存在但不合法!");
        }
        //获取接收到的签名
        let return_sign = this.GetValue("sign").toString();
        //在本地计算新的签名
        let cal_sign = this.MakeSign(signType);
        if (cal_sign == return_sign) {
            return true;
        }
        throw new wxPayException_1.WxPayException("WxPayData签名验证错误!");
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
            let xmlNode;
            if (!xml) {
                throw new Error("将空的xml串转换为WxPayData不合法!");
            }
            if (Util_1.Util.IsString(xml)) {
                xmlNode = yield xml2js.parseStringPromise(xml);
            }
            else if (Util_1.Util.IsObject(xml)) {
                xmlNode = xml;
            }
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
            return this.md5(str);
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
    md5(plaintext) {
        return MD5(plaintext).toString();
    }
}
exports.WxPayData = WxPayData;
WxPayData.SIGN_TYPE_MD5 = "MD5";
WxPayData.SIGN_TYPE_HMAC_SHA256 = "HMAC-SHA256";
class ResponseData {
    constructor() {
    }
}
exports.ResponseData = ResponseData;
class WeixinConfig {
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
    }
}
exports.WeixinConfig = WeixinConfig;
/**
 * h5场景信息
 */
class SceneInfo {
    constructor(type, wap_url, wap_name) {
        this.type = type;
        this.wap_url = wap_url;
        this.wap_name = wap_name;
    }
}
exports.SceneInfo = SceneInfo;
