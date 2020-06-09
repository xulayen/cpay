
//import * as xml2js from 'xml2js';

namespace cPay {
    export class WxPayData {
        public SIGN_TYPE_MD5: string = "MD5";
        public SIGN_TYPE_HMAC_SHA256: string = "HMAC-SHA256";
        public m_values = {};

        SetValue(key, value) {
            this.m_values[key] = value;
        }

        GetValue(key) {
            return this.m_values[key];
        }

        IsSet(key) {
            let o = this.m_values[key];;
            if (null != o)
                return true;
            else
                return false;
        }

        ToXml() {
            //数据为空时不能转化为xml格式
            if (!this.m_values) {
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
            if (xml) {
                throw new Error("将空的xml串转换为WxPayData不合法!");
            }
            let xmlNode = await xml2js.parseStringPromise(xml);

            for (let xe in xmlNode) {
                //获取xml的键值对到WxPayData内部的数据中
            }

        }



    }
}