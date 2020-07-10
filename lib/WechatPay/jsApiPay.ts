import * as  cPay from '../wxPayApi';
import * as  cPay_Config from '../Config';
import * as  cPay_Exception from '../Exception/wxPayException';
import * as  cPay_Model from '../Model';
import { format, addMinutes } from 'date-fns';
import Constant from '../Config/constant';
import * as  cPay_Util from '../Util';
import { BasePay } from './basePay';

const WxPayData = cPay_Model.WxPayData;
const WxPayApi = cPay.WxPayApi;
const Util = cPay_Util.Util;
const WxPayException = cPay_Exception.WxPayException;

/**
 * JSAPI支付
 *
 * @export
 * @class JsApiPay
 */
export class JsApiPay extends BasePay {

    private _openid: string;
    private _access_token: string;
    private _refresh_token: string;
    private _expires_in: number;
    private request: any;
    private response: any;
    private next: any;
    private config: any;
    public WeixinUserInfo: cPay_Model.WeixinUserInfo;
    constructor(request: any, response: any, next: any) {
        super();
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

    /**
     * JSAPI统一下单 √
     *
     * @param {string} openid 用户微信号
     * @param {*} [options] 可选参数对象如{key:value}
     * @returns {Promise<cPay_Model.ResponseData>}
     * @memberof JsApiPay
     */
    public async UnifiedOrder(openid: string, options?: any): Promise<cPay_Model.ResponseData> {
        //统一下单
        let req = new WxPayData(), response_data = new cPay_Model.ResponseData();
        req.SetValue("body", this.orderInfo.body);
        req.SetValue("attach", this.orderInfo.attach);
        req.SetValue("out_trade_no", WxPayApi.GenerateOutTradeNo());
        req.SetValue("total_fee", this.orderInfo.total_fee);
        req.SetValue("time_start", format(new Date(), "yyyyMMddHHmmss"));
        req.SetValue("time_expire", format(addMinutes(new Date(), 10), "yyyyMMddHHmmss"));
        req.SetValue("goods_tag", this.orderInfo.goods_tag);
        req.SetValue("trade_type", Constant.WEIXIN_trade_type_JSAPI);
        req.SetValue("openid", openid);
        for (let key in options) {
            req.SetValue(key, options[key]);
        }
        let result = await WxPayApi.UnifiedOrder(req);
        if (!result.IsSet("appid") || !result.IsSet("prepay_id") || result.GetValue("prepay_id").toString() == "") {
            console.log("UnifiedOrder response error!");
            throw new WxPayException("UnifiedOrder response error!");
        }
        this.UnifiedOrderResult = result;
        response_data.data = result;
        response_data.return_code = result.m_values.get("return_code");
        response_data.msg = result.m_values.get("return_msg");
        response_data.result_code = result.m_values.get("result_code");
        return response_data;
    }

    /**
     * 下单成功后，获取微信支付相关参数 √
     */
    public GetJsApiPayParameters(): string {
        console.log("JsApiPay::GetJsApiParam is processing...");
        let jsApiParam = new WxPayData();
        jsApiParam.SetValue("appId", this.UnifiedOrderResult.GetValue("appid"));
        jsApiParam.SetValue("timeStamp", WxPayApi.GenerateTimeStamp());
        jsApiParam.SetValue("nonceStr", WxPayApi.GenerateNonceStr());
        jsApiParam.SetValue("package", "prepay_id=" + this.UnifiedOrderResult.GetValue("prepay_id"));
        jsApiParam.SetValue("signType", WxPayData.SIGN_TYPE_HMAC_SHA256);
        jsApiParam.SetValue("paySign", jsApiParam.MakeSign());
        let param = jsApiParam.ToJson();
        console.log('JsApiPay::GetJsApiParam - ');
        console.log(param);
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
                this.WeixinUserInfo = new cPay_Model.WeixinUserInfo();
                this.WeixinUserInfo = res;
            }
            return true;
        }
    }
}


