namespace cPay {
    export class NativePay {

        GetPrePayUrl(productId): string {
            console.log("Native pay mode 1 url is producing...")
            let data = new WxPayData();
            data.SetValue("appid", WxPayConfig.GetConfig().GetAppID());//公众帐号id
            data.SetValue("mch_id", WxPayConfig.GetConfig().GetMchID());//商户号
            data.SetValue("time_stamp", WxPayApi.GenerateTimeStamp());//时间戳
            data.SetValue("nonce_str", WxPayApi.GenerateNonceStr());//随机字符串
            data.SetValue("product_id", productId);//商品ID
            data.SetValue("sign", data.MakeSign());//签名
            let str = this.ToUrlParams(data.GetValues());//转换为URL串
            let url = "weixin://wxpay/bizpayurl?" + str;
            console.log("Get native pay mode 1 url : " + url);
            return url;
        }

        
        ToUrlParams(map: any) {
            let buff = "";
            for (let key in map) {
                let value = map[key];
                buff += key + "=" + value + "&";
            }
            buff = buff.trim();
            return buff;
        }


    }
}