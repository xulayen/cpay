import { cPay } from '../WxPayApi';
import { cPay_Config } from '../Config/WxPayConfig';
import { cPay_Exception } from '../Exception/WxPayException';
import { cPay_Model } from '../Model';
import { format, addMinutes } from 'date-fns';
import Constant from '../Config/Constant';
import { cPay_Util } from '../Util';

export namespace cPay_JsApiPay {

    const WxPayData = cPay.WxPayData;
    const WxPayApi = cPay.WxPayApi;
    const config = cPay_Config.WxPayConfig.GetConfig();
    const Util = cPay_Util.Util;
    const WxPayException = cPay_Exception.WxPayException;

    export class JsApiPay {

        public openid: string;
        public access_token: string;
        public total_fee: number;
        public unifiedOrderResult: cPay.WxPayData;
        public orderInfo: cPay_Model.OrderInfo;

        private request: any;
        private response: any;
        private next: any;
        constructor(request, response, next) {
            this.request = request;
            this.response = response;
            this.next = next;
        }


        public async GetUnifiedOrderResult(): Promise<cPay.WxPayData> {
            //统一下单
            let data = new WxPayData();
            data.SetValue("body", this.orderInfo.body);
            data.SetValue("attach", this.orderInfo.attach);
            data.SetValue("out_trade_no", WxPayApi.GenerateOutTradeNo());
            data.SetValue("total_fee", this.total_fee);
            data.SetValue("time_start", format(new Date(), "yyyyMMddHHmmss"));
            data.SetValue("time_expire", format(addMinutes(new Date(), 10), "yyyyMMddHHmmss"));
            data.SetValue("goods_tag", this.orderInfo.goods_tag);
            data.SetValue("trade_type", Constant.WEIXIN_trade_type_JSAPI);
            data.SetValue("openid", this.openid);
            let result = await WxPayApi.UnifiedOrder(data);
            if (!result.IsSet("appid") || !result.IsSet("prepay_id") || result.GetValue("prepay_id").ToString() == "") {
                console.log("UnifiedOrder response error!");
                throw new WxPayException("UnifiedOrder response error!");
            }
            this.unifiedOrderResult = result;
            return result;

        }


        public GetJsApiParameters(): string {
            console.log("JsApiPay::GetJsApiParam is processing...");
            let jsApiParam = new WxPayData();
            jsApiParam.SetValue("appId", this.unifiedOrderResult.GetValue("appid"));
            jsApiParam.SetValue("timeStamp", WxPayApi.GenerateTimeStamp());
            jsApiParam.SetValue("nonceStr", WxPayApi.GenerateNonceStr());
            jsApiParam.SetValue("package", "prepay_id=" + this.unifiedOrderResult.GetValue("prepay_id"));
            jsApiParam.SetValue("signType", WxPayData.SIGN_TYPE_HMAC_SHA256);
            jsApiParam.SetValue("paySign", jsApiParam.MakeSign());
            let xml = jsApiParam.ToJson();
            console.log('JsApiPay::GetJsApiParam - ' + xml);
            return xml;
        }


        public async GetOpenidAndAccessToken(): Promise<void> {
            let code = this.request.query.code;
            if (code) {
                console.log("Get code : " + code);
                this.GetOpenidAndAccessTokenFromCode(code);
            } else {
                let redirect_uri = decodeURIComponent(`http://auth.weixin.zhsh.co/api/wechat/authorize-code?redirectUrl=http://baidu.com`);
                let data = new WxPayData();
                data.SetValue("appid", config.GetAppID());
                data.SetValue("redirect_uri", redirect_uri);
                data.SetValue("response_type", "code");
                data.SetValue("scope", "snsapi_base");
                data.SetValue("state", `STATE#wechat_redirect`);
                //触发微信返回code码
                let url = `${Constant.WEIXIN_auth2_authorize}${data.ToUrl()}`;
                console.log("Will Redirect to URL : " + url);
                this.response.redirect(url);
            }
        }

        public async GetOpenidAndAccessTokenFromCode(code: string): Promise<void> {
            //构造获取openid及access_token的url
            let data = new WxPayData();
            data.SetValue("appid", config.GetAppID());
            data.SetValue("secret", config.GetAppSecret());
            data.SetValue("code", code);
            data.SetValue("grant_type", "authorization_code");
            let url = `${Constant.WEIXIN_auth2_access_token}${data.ToUrl()}`;
            console.log(`获取access_token-request: \n${url}`);
            let res = await Util.setMethodWithUri({
                url: url,
                method: 'get'
            });
            this.access_token = res.access_token;
            this.openid = res.openid;
            console.log(`获取access_token-response: \n${res}`);
        }




    }
}