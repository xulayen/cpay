import { cPay } from '../WxPayApi';
import { cPay_Config } from '../Config';
import { cPay_Exception } from '../Exception/WxPayException';
import { cPay_Model } from '../Model';
import { format, addMinutes } from 'date-fns';
import Constant from '../Config/Constant';
import { cPay_Util } from '../Util';

export namespace cPay_JsApiPay {

    const WxPayData = cPay.WxPayData;
    const WxPayApi = cPay.WxPayApi;
    const config = cPay_Config.Config.GetWxPayConfig();
    const Util = cPay_Util.Util;
    const redisclient = cPay_Util.Util.redisClient;
    const WxPayException = cPay_Exception.WxPayException;

    const Redis_KEY_access_token = `cpay:wap-auth:${config.GetAppID()}:access_token`;
    const Redis_KEY_refresh_token = `cpay:wap-auth:${config.GetAppID()}:refresh_token`;

    export class JsApiPay {

        public WeixinUserInfo: WeixinUserInfo;

        private _openid: string;
        public get openid(): string {
            return this._openid;
        }
        private _access_token: string;
        public get access_token(): string {
            return this._access_token;
        }
        private _total_fee: number;
        public get total_fee(): number {
            return this._total_fee;
        }
        public set total_fee(value: number) {
            this._total_fee = value;
        }
        private _unifiedOrderResult: cPay.WxPayData;
        public get unifiedOrderResult(): cPay.WxPayData {
            return this._unifiedOrderResult;
        }

        private _refresh_token: string;
        public get refresh_token(): string {
            return this._refresh_token;
        }

        private _expires_in: number;
        public get expires_in(): number {
            return this._expires_in;
        }

        private request: any;
        private response: any;
        private next: any;
        constructor(request, response, next) {
            this.request = request;
            this.response = response;
            this.next = next;
        }

        public async GetWeixinUserInfo(uri: string, silence: boolean = true): Promise<void> {
            let usecache = await this.UseCaheAccessTokenGetUserInfo();
            if (usecache)
                return;
            let code = this.request.query.code;
            if (code) {
                console.log("Get code : " + code);
                await this.GetOpenidAndAccessTokenFromCode(code, uri);
            } else {
                let redirect_uri = config.GetRedirect_uri();
                let data = new WxPayData();
                data.SetValue("appid", config.GetAppID());
                data.SetValue("redirect_uri", redirect_uri);
                data.SetValue("response_type", "code");
                data.SetValue("scope", silence ? "snsapi_base" : "snsapi_userinfo");
                data.SetValue("state", `STATE#wechat_redirect`);
                //触发微信返回code码
                let url = `${Constant.WEIXIN_auth2_authorize}${data.ToUrl()}`;
                console.log("Will Redirect to URL : " + url);
                this.response.redirect(url);
            }
        }

        public async GetUnifiedOrderResult(orderInfo: cPay_Model.OrderInfo, openid: string): Promise<cPay.WxPayData> {
            //统一下单
            let data = new WxPayData();
            data.SetValue("body", orderInfo.body);
            data.SetValue("attach", orderInfo.attach);
            data.SetValue("out_trade_no", WxPayApi.GenerateOutTradeNo());
            data.SetValue("total_fee", this.total_fee);
            data.SetValue("time_start", format(new Date(), "yyyyMMddHHmmss"));
            data.SetValue("time_expire", format(addMinutes(new Date(), 10), "yyyyMMddHHmmss"));
            data.SetValue("goods_tag", orderInfo.goods_tag);
            data.SetValue("trade_type", Constant.WEIXIN_trade_type_JSAPI);
            data.SetValue("openid", openid);
            let result = await WxPayApi.UnifiedOrder(data);
            if (!result.IsSet("appid") || !result.IsSet("prepay_id") || result.GetValue("prepay_id").ToString() == "") {
                console.log("UnifiedOrder response error!");
                throw new WxPayException("UnifiedOrder response error!");
            }
            this._unifiedOrderResult = result;
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
            let param = jsApiParam.ToJson();
            console.log('JsApiPay::GetJsApiParam - ' + param);
            return param;
        }



        private async GetOpenidAndAccessTokenFromCode(code: string, uri: string): Promise<void> {
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
            console.log(`获取access_token-response: \n${res}`);
            res = JSON.parse(res);
            if (res.errcode && res.errcode > 0)
                return;
            this.updateRedisTokenCache(res);
            await this.UseCaheAccessTokenGetUserInfo();
            this.response.redirect(`${uri}?openid=${this.openid}`);
        }

        private async RefreshToken(): Promise<boolean> {
            let data = new WxPayData(), r_refresh_token = await redisclient.get(Redis_KEY_refresh_token);
            data.SetValue("appid", config.GetAppID());
            data.SetValue("grant_type", "refresh_token");
            data.SetValue("refresh_token", r_refresh_token);
            let url = `${Constant.WEIXIN_auth2_refresh_token}${data.ToUrl()}`;
            console.log(`刷新access_token-request: \n${url}`);
            let res = await Util.setMethodWithUri({
                url: url,
                method: 'get'
            });
            console.log(`刷新access_token-response: \n${res}`);
            res = JSON.parse(res);
            if (res.errcode && res.errcode > 0) {
                return false;
            }
            this.updateRedisTokenCache(res);
            return true;

        }

        private updateRedisTokenCache(res: any): void {
            debugger;
            this._access_token = res.access_token;
            this._openid = res.openid;
            this._refresh_token = res.refresh_token;
            this._expires_in = res.expires_in;
            redisclient.set(Redis_KEY_access_token, this._access_token);
            redisclient.set(Redis_KEY_refresh_token, this.refresh_token, (60 * 60 * 24 * 29));
        }

        private async UseCaheAccessTokenGetUserInfo(): Promise<boolean> {
            debugger;
            let r_access_token = await redisclient.get(Redis_KEY_access_token),
                data = new WxPayData();
            data.SetValue("access_token", r_access_token);
            data.SetValue("openid", this.openid);
            data.SetValue("lang", "zh_CN");
            if (r_access_token) {
                let url = `${Constant.WEIXIN_auth2_userinfo}${data.ToUrl()}`;
                console.log(`使用Redis缓存access_token-获取微信信息-request: \n${url}`);
                let res = await Util.setMethodWithUri({
                    url: url,
                    method: 'get'
                });
                console.log(`使用Redis缓存access_token-获取微信信息-response: \n${res}`);
                res = JSON.parse(res);
                if (res.errcode && res.errcode > 0) {
                    return false;
                } else {
                    this.WeixinUserInfo = new WeixinUserInfo();
                    this.WeixinUserInfo = res;
                }
                return true;
            } else {
                let status = await this.RefreshToken();
                if (status)
                    await this.UseCaheAccessTokenGetUserInfo();
                else
                    return false
            }
        }
    }


    class WeixinUserInfo {
        constructor() {

        }
        public openid: string;
        public nickname: string;
        public sex: string;
        public province: string;
        public city: string;
        public country: string;
        public headimgurl: string;
        public privilege: string[];
        public unionid: string;
    }
}