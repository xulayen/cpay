
import { cPay } from '../WxPayApi';
import { cPay_Config } from '../config/WxPayConfig';
import { format } from 'date-fns';

export namespace cPay_NativePay {

    const WxPayData = cPay.WxPayData;
    const WxPayApi = cPay.WxPayApi;
    const config = cPay_Config.WxPayConfig.GetConfig();

    export class NativePay {

        constructor() { }

        GetPrePayUrl(productId): string {
            console.log("Native pay mode 1 url is producing...")

            let data = new WxPayData();
            data.SetValue("appid", config.GetAppID());//公众帐号id
            data.SetValue("mch_id", config.GetMchID());//商户号
            data.SetValue("time_stamp", WxPayApi.GenerateTimeStamp());//时间戳
            data.SetValue("nonce_str", WxPayApi.GenerateNonceStr());//随机字符串
            data.SetValue("product_id", productId);//商品ID
            data.SetValue("sign", data.MakeSign());//签名
            let str = this.ToUrlParams(data.GetValues());//转换为URL串
            let url = "weixin://wxpay/bizpayurl?" + str;
            console.log("生成扫码支付模式一 : " + url);
            return url;
        }


        private ToUrlParams(map: any) {
            let buff = "";
            map.forEach(function (value, key) {
                if (!value) {
                    throw new Error("WxPayData内部含有值为null的字段!");
                }
                if (value != "") {
                    buff += key + "=" + value + "&";
                }

            });

            buff = buff.trim();
            return buff;
        }


    }

    class Notify {
        constructor() {

        }

        public async ProcessNotify(req, res, next): Promise<void> {

        }

        async GetNotifyData(req, res, next): Promise<cPay.WxPayData> {

            let builder = req.body, data = new WxPayData();
            try {

                await data.FromXml(builder.ToString());

            } catch (ex) {
                //若签名错误，则立即返回结果给微信支付后台
                let res = new WxPayData();
                res.SetValue("return_code", "FAIL");
                res.SetValue("return_msg", ex.Message);
                console.error("Sign check error : " + res.ToXml());
                return res;
            }
            return data;

        }

    }


    export class NativeNotify extends Notify {

        constructor() {
            super();
        }

        public async ProcessNotify(req, res, next): Promise<void> {
            let notifyData = await super.GetNotifyData(req, res, next);

            if (!notifyData.IsSet("openid") || !notifyData.IsSet("product_id")) {
                let res = new WxPayData();
                res.SetValue("return_code", "FAIL");
                res.SetValue("return_msg", "回调数据异常");
                console.error("The data WeChat post is error : " + res.ToXml());
                return;
            }

            //调统一下单接口，获得下单结果
            let openid = notifyData.GetValue("openid").ToString(),
                product_id = notifyData.GetValue("product_id").ToString(),
                unifiedOrderResult = new WxPayData();


        }

        public UnifiedOrder(openId: string, productId: string) {
            //统一下单
            let req = new WxPayData();
            req.SetValue("body", "test");
            req.SetValue("attach", "test");
            req.SetValue("out_trade_no", WxPayApi.GenerateOutTradeNo());
            req.SetValue("total_fee", 1);
            req.SetValue("time_start", format("yyyyMMddHHmmss"));
            req.SetValue("time_expire", format("yyyyMMddHHmmss"));
            req.SetValue("goods_tag", "test");
            req.SetValue("trade_type", "NATIVE");
            req.SetValue("openid", openId);
            req.SetValue("product_id", productId);
            let result = WxPayApi.UnifiedOrder(req);
            return result;
        }



    }
}