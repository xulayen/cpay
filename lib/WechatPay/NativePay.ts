import { cPay } from '../WxPayApi';
import { cPay_Config } from '../Config/WxPayConfig';
import { format, addMinutes } from 'date-fns';
import Constant from '../Config/Constant';

export namespace cPay_NativePay {

    const WxPayData = cPay.WxPayData;
    const WxPayApi = cPay.WxPayApi;
    const config = cPay_Config.WxPayConfig.GetConfig();

    export class NativePay {

        constructor() { }

        GetPrePayUrl(productId): string {
            console.log("Native pay mode 1 url is producing...");
            let data = new WxPayData();
            data.SetValue("appid", config.GetAppID());//公众帐号id
            data.SetValue("mch_id", config.GetMchID());//商户号
            data.SetValue("time_stamp", WxPayApi.GenerateTimeStamp());//时间戳
            data.SetValue("nonce_str", WxPayApi.GenerateNonceStr());//随机字符串
            data.SetValue("product_id", productId);//商品ID
            data.SetValue("sign", data.MakeSign());//签名
            let str = this.ToUrlParams(data.GetValues());//转换为URL串
            let url =`${Constant.WEIXIN_wxpay_bizpayurl}${str}`;
            console.log("生成扫码支付模式1 : " + url);
            return url;
        }

        async GetPayUrl(productId: string): Promise<string> {

            console.log("Native pay mode 2 url is producing...");
            let data = new WxPayData(),url="";
            data.SetValue("body", "test");//商品描述
            data.SetValue("attach", "test");//附加数据
            data.SetValue("out_trade_no", WxPayApi.GenerateOutTradeNo());//随机字符串
            data.SetValue("total_fee", 1);//总金额
            data.SetValue("time_start", format(new Date(), "yyyyMMddHHmmss"));//交易起始时间
            data.SetValue("time_expire", format(addMinutes(new Date(), 10), "yyyyMMddHHmmss"));//交易结束时间
            data.SetValue("goods_tag", "jjj");//商品标记
            data.SetValue("trade_type", Constant.WEIXIN_trade_type_NATIVE);//交易类型
            data.SetValue("product_id", productId);//商品ID
            let result = await WxPayApi.UnifiedOrder(data);//调用统一下单接口
            if (result.IsSet("code_url")) {
                url = result.GetValue("code_url").toString();//获得统一下单接口返回的二维码链接
                console.log("Get native pay mode 2 url : " + url);
            }
            console.log("生成扫码支付模式2 : " + url);
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
}