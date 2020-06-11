import { cPay_Config } from './config/WxPayConfig';
var xml2js = require("xml2js");
var cryptojs = require("crypto-js");
var MD5 = require('crypto-js/md5');


export namespace cPay {

    const WxPayConfig = cPay_Config.WxPayConfig;

    export class WxPayData {
        public SIGN_TYPE_MD5: string = "MD5";
        public SIGN_TYPE_HMAC_SHA256: string = "HMAC-SHA256";
        public m_values = new Map();

        constructor() { }

        SetValue(key, value) {
            //this.m_values[key] = value;
            this.m_values.set(key, value);
        }

        GetValue(key) {
            //return this.m_values[key];
            return this.m_values.get(key);
        }

        IsSet(key) {
            return this.m_values.has(key);
            // let o = this.m_values.get(key);
            // if (o)
            //     return true;
            // else
            //     return false;
        }

        ToXml() {
            //数据为空时不能转化为xml格式
            if (this.m_values.size === 0) {
                throw new Error("WxPayData数据为空!");
            }

            let xml = "<xml>";
            for (let key in this.m_values) {
                let value = this.m_values[key];
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
                else//除了string和int类型不能含有其他数据类型
                {
                    throw new Error("WxPayData字段数据类型错误!");
                }
            }
            xml += "</xml>";
            return xml;
        }


        async FromXml(xml: string) {
            debugger;
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


        // MakeSign(signType: string): string {
        //     return "";
        // }

        MakeSign(signType: string = this.SIGN_TYPE_HMAC_SHA256): any {
            //转url格式
            let str = this.ToUrl();
            //在string后加入API KEY
            str += "&key=" + WxPayConfig.GetConfig().GetKey();
            if (signType === this.SIGN_TYPE_MD5) {
                return this.md5(str, WxPayConfig.GetConfig().GetKey());
            }
            else if (signType === this.SIGN_TYPE_HMAC_SHA256) {

                return this.CalcHMACSHA256Hash(str, WxPayConfig.GetConfig().GetKey());

            } else {
                throw new Error("sign_type 不合法");
            }
        }

        ToUrl() {
            // console.log(this.m_values)
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
    }
}