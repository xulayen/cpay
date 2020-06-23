import * as  cPay from '../wxPayApi';
import * as  cPay_Config from '../Config';
import * as  cPay_Exception from '../Exception/wxPayException';
import * as  cPay_Model from '../Model';
import { format, addMinutes } from 'date-fns';
import Constant from '../Config/constant';
import * as  cPay_Util from '../Util';

const WxPayData = cPay_Model.WxPayData;
const WxPayApi = cPay.WxPayApi;
const Util = cPay_Util.Util;
const WxPayException = cPay_Exception.WxPayException;

export class JsApiPay {

    private _openid: string;
    private _access_token: string;
    private _unifiedOrderResult: cPay_Model.WxPayData;
    private _refresh_token: string;
    private _expires_in: number;
    private request: any;
    private response: any;
    private next: any;
    private config: any;
    public WeixinUserInfo: WeixinUserInfo;
    constructor(request: any, response: any, next: any) {
        this.request = request;
        this.response = response;
        this.next = next;
        this.config = cPay_Config.Config.GetWxPayConfig();


    }

    public async GetWeixinUserInfo(uri: string, silence: boolean = true): Promise<void> {
        let code = this.request.query.code;
        if (code) {
            console.log("Get code : " + code);
            await this.GetOpenidAndAccessTokenFromCode(code, uri);
        } else {
            let redirect_uri = this.config.GetRedirect_uri();
            let data = new WxPayData();
            data.SetValue("appid", this.config.GetAppID());
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

    public async UnifiedOrder(orderInfo: cPay_Model.OrderInfo, openid: string): Promise<cPay_Model.ResponseData> {
        //统一下单
        let data = new WxPayData(), response_data = new cPay_Model.ResponseData();
        data.SetValue("body", orderInfo.body);
        data.SetValue("attach", orderInfo.attach);
        data.SetValue("out_trade_no", WxPayApi.GenerateOutTradeNo());
        data.SetValue("total_fee", orderInfo.total_fee);
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
        response_data.data = result;
        response_data.return_code = result.m_values.get("return_code");
        response_data.msg = result.m_values.get("return_msg");
        response_data.result_code = result.m_values.get("result_code");
        return response_data;
    }


    public GetJsApiPayParameters(): string {
        console.log("JsApiPay::GetJsApiParam is processing...");
        let jsApiParam = new WxPayData();
        jsApiParam.SetValue("appId", this._unifiedOrderResult.GetValue("appid"));
        jsApiParam.SetValue("timeStamp", WxPayApi.GenerateTimeStamp());
        jsApiParam.SetValue("nonceStr", WxPayApi.GenerateNonceStr());
        jsApiParam.SetValue("package", "prepay_id=" + this._unifiedOrderResult.GetValue("prepay_id"));
        jsApiParam.SetValue("signType", WxPayData.SIGN_TYPE_HMAC_SHA256);
        jsApiParam.SetValue("paySign", jsApiParam.MakeSign());
        let param = jsApiParam.ToJson();
        console.log('JsApiPay::GetJsApiParam - ' + param);
        return param;
    }

    private async GetOpenidAndAccessTokenFromCode(code: string, uri: string): Promise<void> {
        //构造获取openid及access_token的url
        let data = new WxPayData();
        data.SetValue("appid", this.config.GetAppID());
        data.SetValue("secret", this.config.GetAppSecret());
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
        this.AssignmentObj(res);
        await this.UseAccessTokenGetUserInfo();
        this.response.redirect(`${uri}?data=${JSON.stringify(this.WeixinUserInfo)}`);
    }

    private AssignmentObj(res: any): void {
        this._access_token = res.access_token;
        this._openid = res.openid;
        this._refresh_token = res.refresh_token;
        this._expires_in = res.expires_in;
    }

    private async UseAccessTokenGetUserInfo(): Promise<boolean> {
        //  let r_access_token = await redisclient.get(Redis_KEY_access_token);
        let data = new WxPayData();
        data.SetValue("access_token", this._access_token);
        data.SetValue("openid", this._openid);
        data.SetValue("lang", "zh_CN");
        if (this._access_token) {
            let url = `${Constant.WEIXIN_auth2_userinfo}${data.ToUrl()}`;
            console.log(`使用access_token-获取微信信息-request: \n${url}`);
            let res = await Util.setMethodWithUri({
                url: url,
                method: 'get'
            });
            console.log(`使用access_token-获取微信信息-response: \n${res}`);
            res = JSON.parse(res);
            if (res.errcode && res.errcode > 0) {
                return false;
            } else {
                this.WeixinUserInfo = new WeixinUserInfo();
                this.WeixinUserInfo = res;
            }
            return true;
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
