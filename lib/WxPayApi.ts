import { cPay_Config } from './Config/WxPayConfig';
import { cPay_Util } from './Util';
import { format } from 'date-fns';
import { cPay_Exception } from './Exception/WxPayException';
import Constant from './Config/Constant';
const Util = cPay_Util.Util;
var xml2js = require("xml2js");
var cryptojs = require("crypto-js");
var MD5 = require('crypto-js/md5');


export namespace cPay {

    const WxPayConfig = cPay_Config.WxPayConfig;
    const WxPayException = cPay_Exception.WxPayException;

    export class WxPayData {
        public static SIGN_TYPE_MD5: string = "MD5";
        public static SIGN_TYPE_HMAC_SHA256: string = "HMAC-SHA256";
        public m_values = new Map();

        constructor() { }

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
                else//除了string和int类型不能含有其他数据类型
                {
                    throw new Error("WxPayData字段数据类型错误!");
                }
            });
            xml += "</xml>";
            return xml;
        }


        async FromXml(xml: string) {
            if (!xml) {
                throw new Error("将空的xml串转换为WxPayData不合法!");
            }
            let xmlNode = await xml2js.parseStringPromise(xml);

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
            str += "&key=" + WxPayConfig.GetConfig().GetKey();
            if (signType === WxPayData.SIGN_TYPE_MD5) {
                return this.md5(str, WxPayConfig.GetConfig().GetKey());
            }
            else if (signType === WxPayData.SIGN_TYPE_HMAC_SHA256) {

                return this.CalcHMACSHA256Hash(str, WxPayConfig.GetConfig().GetKey());

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


    export class WxPayApi {

        static GenerateTimeStamp(): string {
            return (new Date().getTime() + Math.ceil(Math.random() * 1000)) + "";
        }

        /**
        * 生成随机串，随机串包含字母或数字
        * @return 随机串
        */
        static GenerateNonceStr(): string {
            return (new Date().getTime() + Math.ceil(Math.random() * 1000)) + "";
        }

        static GenerateOutTradeNo(): string {
            return `${WxPayConfig.GetConfig().GetMchID()}${format(new Date(), 'yyyyMMddHHmmss'), Math.ceil(Math.random() * 1000)}`;
        }

        /**
         * 
         * 1、统一下单
         * @static
         * @param {WxPayData} inputObj
         * @returns {Promise<cPay.WxPayData>}
         * @memberof WxPayApi
         */
        static async UnifiedOrder(inputObj: WxPayData): Promise<cPay.WxPayData> {
            let url = Constant.WEIXIN_wxpay_unifiedorder;
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
            if (inputObj.GetValue("trade_type").toString() == "JSAPI" && !inputObj.IsSet("openid")) {
                throw new WxPayException("统一支付接口中，缺少必填参数openid！trade_type为JSAPI时，openid为必填参数！");
            }
            if (inputObj.GetValue("trade_type").toString() == "NATIVE" && !inputObj.IsSet("product_id")) {
                throw new WxPayException("统一支付接口中，缺少必填参数product_id！trade_type为JSAPI时，product_id为必填参数！");
            }

            //异步通知url未设置，则使用配置文件中的url
            if (!inputObj.IsSet("notify_url")) {
                inputObj.SetValue("notify_url", WxPayConfig.GetConfig().GetNotifyUrl());//异步通知url
            }

            inputObj.SetValue("appid", WxPayConfig.GetConfig().GetAppID());//公众账号ID
            inputObj.SetValue("mch_id", WxPayConfig.GetConfig().GetMchID());//商户号
            inputObj.SetValue("spbill_create_ip", WxPayConfig.GetConfig().GetIp());//终端ip	  	    
            inputObj.SetValue("nonce_str", this.GenerateNonceStr());//随机字符串
            inputObj.SetValue("sign_type", cPay.WxPayData.SIGN_TYPE_HMAC_SHA256);//签名类型
            //签名
            inputObj.SetValue("sign", inputObj.MakeSign());

            let xml = inputObj.ToXml();

            console.log("WxPayApi", "统一下单 request : " + xml);
            let res = await Util.setMethodWithUri({
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
        }

        /**
         *
         * 查询订单
         * @static
         * @param {cPay.WxPayData} inputObj
         * @returns {Promise<cPay.WxPayData>}
         * @memberof WxPayApi
         */
        static async OrderQuery(inputObj: cPay.WxPayData): Promise<cPay.WxPayData> {
            let url = Constant.WEIXIN_wxpay_orderquery;
            //检测必填参数
            if (!inputObj.IsSet("out_trade_no") && !inputObj.IsSet("transaction_id")) {
                throw new WxPayException("订单查询接口中，out_trade_no、transaction_id至少填一个！");
            }

            inputObj.SetValue("appid", WxPayConfig.GetConfig().GetAppID());//公众账号ID
            inputObj.SetValue("mch_id", WxPayConfig.GetConfig().GetMchID());//商户号
            inputObj.SetValue("nonce_str", WxPayApi.GenerateNonceStr());//随机字符串
            inputObj.SetValue("sign_type", WxPayData.SIGN_TYPE_HMAC_SHA256);//签名类型
            inputObj.SetValue("sign", inputObj.MakeSign());//签名
            let xml = inputObj.ToXml();

            console.log(`查询订单-request: \n${xml}`);
            let res = await Util.setMethodWithUri({
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

        }


    }





}