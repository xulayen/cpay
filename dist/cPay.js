/// <reference path = "./IConfig.ts" />   
var cPay;
(function (cPay) {
    var DemoConfig = /** @class */ (function () {
        function DemoConfig() {
        }
        DemoConfig.prototype.GetAppID = function () {
            throw new Error("Method not implemented.");
        };
        DemoConfig.prototype.GetMchID = function () {
            throw new Error("Method not implemented.");
        };
        DemoConfig.prototype.GetKey = function () {
            throw new Error("Method not implemented.");
        };
        DemoConfig.prototype.GetAppSecret = function () {
            throw new Error("Method not implemented.");
        };
        DemoConfig.prototype.GetSSlCertPath = function () {
            throw new Error("Method not implemented.");
        };
        DemoConfig.prototype.GetSSlCertPassword = function () {
            throw new Error("Method not implemented.");
        };
        DemoConfig.prototype.GetNotifyUrl = function () {
            throw new Error("Method not implemented.");
        };
        DemoConfig.prototype.GetIp = function () {
            throw new Error("Method not implemented.");
        };
        DemoConfig.prototype.GetProxyUrl = function () {
            throw new Error("Method not implemented.");
        };
        DemoConfig.prototype.GetReportLevel = function () {
            throw new Error("Method not implemented.");
        };
        DemoConfig.prototype.GetLogLevel = function () {
            throw new Error("Method not implemented.");
        };
        return DemoConfig;
    }());
    cPay.DemoConfig = DemoConfig;
})(cPay || (cPay = {}));
/// <reference path = "./IConfig.ts" />   
/// <reference path = "./DemoConfig.ts" />  
var cPay;
(function (cPay) {
    var WxPayConfig = /** @class */ (function () {
        function WxPayConfig() {
        }
        WxPayConfig.GetConfig = function () {
            if (this.config === null)
                this.config = new cPay.DemoConfig();
            return this.config;
        };
        return WxPayConfig;
    }());
    cPay.WxPayConfig = WxPayConfig;
})(cPay || (cPay = {}));
/// <reference path = "./config/WxPayConfig.ts" />  
//import * as xml2js from 'xml2js';
var cPay;
(function (cPay) {
    var WxPayData = /** @class */ (function () {
        function WxPayData() {
            this.SIGN_TYPE_MD5 = "MD5";
            this.SIGN_TYPE_HMAC_SHA256 = "HMAC-SHA256";
            this.m_values = {};
        }
        WxPayData.prototype.SetValue = function (key, value) {
            this.m_values[key] = value;
        };
        WxPayData.prototype.GetValue = function (key) {
            return this.m_values[key];
        };
        WxPayData.prototype.IsSet = function (key) {
            var o = this.m_values[key];
            ;
            if (null != o)
                return true;
            else
                return false;
        };
        WxPayData.prototype.ToXml = function () {
            //数据为空时不能转化为xml格式
            if (!this.m_values) {
                throw new Error("WxPayData数据为空!");
            }
            var xml = "<xml>";
            for (var key in this.m_values) {
                var value = this.m_values[key];
                //字段值不能为null，会影响后续流程
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
            }
            xml += "</xml>";
            return xml;
        };
        // async FromXml(xml: string) {
        //     if (xml) {
        //         throw new Error("将空的xml串转换为WxPayData不合法!");
        //     }
        //     let xmlNode = await xml2js.parseStringPromise(xml);
        //     for (let xe in xmlNode) {
        //         //获取xml的键值对到WxPayData内部的数据中
        //     }
        // }
        // MakeSign(signType: string): string {
        //     return "";
        // }
        WxPayData.prototype.MakeSign = function (signType) {
            if (signType === void 0) { signType = this.SIGN_TYPE_HMAC_SHA256; }
            //转url格式
            var str = this.ToUrl();
            //在string后加入API KEY
            str += "&key=" + cPay.WxPayConfig.GetConfig().GetKey();
            if (signType === this.SIGN_TYPE_MD5) {
            }
            else if (signType === this.SIGN_TYPE_HMAC_SHA256) {
                return this.CalcHMACSHA256Hash(str, cPay.WxPayConfig.GetConfig().GetKey());
            }
            else {
                throw new Error("sign_type 不合法");
            }
        };
        WxPayData.prototype.ToUrl = function () {
            var buff = '';
            for (var key in this.m_values) {
                var value = this.m_values[key];
                if (!value) {
                    throw new Error("WxPayData内部含有值为null的字段!");
                }
                if (key != "sign" && value != "") {
                    buff += key + "=" + value + "&";
                }
            }
            buff = buff.trim();
            return buff;
        };
        WxPayData.prototype.CalcHMACSHA256Hash = function (plaintext, salt) {
            return "";
        };
        WxPayData.prototype.GetValues = function () {
            return this.m_values;
        };
        return WxPayData;
    }());
    cPay.WxPayData = WxPayData;
})(cPay || (cPay = {}));
var cPay;
(function (cPay) {
    var WxPayApi = /** @class */ (function () {
        function WxPayApi() {
        }
        WxPayApi.GenerateTimeStamp = function () {
            return (new Date().getTime() + (Math.random() * 1000)) + "";
        };
        /**
        * 生成随机串，随机串包含字母或数字
        * @return 随机串
        */
        WxPayApi.GenerateNonceStr = function () {
            return (new Date().getTime() + (Math.random() * 1000)) + "";
        };
        return WxPayApi;
    }());
    cPay.WxPayApi = WxPayApi;
})(cPay || (cPay = {}));
/// <reference path = "../WxPayData.ts" />   
/// <reference path = "../config/WxPayConfig.ts" /> 
/// <reference path = "../WxPayApi.ts" />  
var cPay;
(function (cPay) {
    var NativePay = /** @class */ (function () {
        function NativePay() {
        }
        NativePay.prototype.GetPrePayUrl = function (productId) {
            console.log("Native pay mode 1 url is producing...");
            var data = new cPay.WxPayData();
            data.SetValue("appid", cPay.WxPayConfig.GetConfig().GetAppID()); //公众帐号id
            data.SetValue("mch_id", cPay.WxPayConfig.GetConfig().GetMchID()); //商户号
            data.SetValue("time_stamp", cPay.WxPayApi.GenerateTimeStamp()); //时间戳
            data.SetValue("nonce_str", cPay.WxPayApi.GenerateNonceStr()); //随机字符串
            data.SetValue("product_id", productId); //商品ID
            data.SetValue("sign", data.MakeSign()); //签名
            var str = this.ToUrlParams(data.GetValues()); //转换为URL串
            var url = "weixin://wxpay/bizpayurl?" + str;
            console.log("Get native pay mode 1 url : " + url);
            return url;
        };
        NativePay.prototype.ToUrlParams = function (map) {
            var buff = "";
            for (var key in map) {
                var value = map[key];
                buff += key + "=" + value + "&";
            }
            buff = buff.trim();
            return buff;
        };
        return NativePay;
    }());
    cPay.NativePay = NativePay;
})(cPay || (cPay = {}));
