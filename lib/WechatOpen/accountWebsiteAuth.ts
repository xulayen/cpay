import * as  cPay from '../wxPayApi';
import * as  cPay_Config from '../Config';
import * as  cPay_Exception from '../Exception/wxPayException';
import * as  cPay_Model from '../Model';
import { format, addMinutes } from 'date-fns';
import Constant from '../Config/constant';
import * as  cPay_Util from '../Util';
import { BaseRequest, IBaseWeixinInfo } from '../base';
import { WxOpenApi } from '../wxOpenApi';

const WxPayData = cPay_Model.WxPayData;
const WxPayApi = cPay.WxPayApi;
const Util = cPay_Util.Util;
const WxPayException = cPay_Exception.WxPayException;


/**
 * 开放平台代替公众号进行微信授权
 * https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/Official_Accounts/official_account_website_authorization.html
 * @export
 * @class AccountWebsiteAuth
 */
export class AccountWebsiteAuth extends BaseRequest implements IBaseWeixinInfo {
    private _openid: string;
    private _access_token: string;
    private _refresh_token: string;
    private _expires_in: number;
    private config: cPay_Config.IWxConfig;
    public WeixinUserInfo: cPay_Model.WeixinUserInfo;
    constructor(request: any, response: any, next: any) {
        super(request, response, next);
        this.config = cPay_Config.Config.GetWxPayConfig();
    }

    /**
     * 
     * 获取用户信息
     * @param {string} appid 公众号APPID
     * @param {boolean} [silence=true] 是否是静默授权，true代表静默授权
     * @returns {Promise<void>}
     * @memberof AccountWebsiteAuth
     */
    public async GetWeixinUserInfo(appid: string, silence: boolean = true): Promise<void> {
        let code = this.request.query.code;
        if (code) {
            console.log("Get code : " + code);
            return await this.GetWeixinUserInfoFromCode(appid, code);
        } else {
            let data = new WxPayData();
            data.SetValue("appid", appid);
            data.SetValue("redirect_uri", this.config.GetRedirect_uri());
            data.SetValue("response_type", "code");
            data.SetValue("scope", silence ? "snsapi_base" : "snsapi_userinfo");
            data.SetValue("state", `STATE#wechat_redirect`);
            data.SetValue("component_appid", this.config.GetOpenAppid());
            //触发微信返回code码
            let url = `${Constant.WEIXIN_auth2_authorize}${data.ToUrl()}`;
            console.log("Will Redirect to URL : " + url);
            this.response.redirect(url);
        }
    }

    /**
     * 根据回调的CODE和appid获取微信信息
     * @param {string} appid 公众号信息
     * @param {string} code 获取的code
     * @returns {Promise<void>} 
     * @memberof AccountWebsiteAuth
     */
    public async GetWeixinUserInfoFromCode(appid: string, code?: string): Promise<void> {
        if (!code) {
            code = this.request.query.code;
        }
        //构造获取openid及access_token的url
        let data = new WxPayData();
        data.SetValue("appid", appid);
        data.SetValue("code", code);
        data.SetValue("grant_type", "authorization_code");
        data.SetValue("component_appid", this.config.GetOpenAppid());
        let component_access_token = await WxOpenApi.GetComponent_access_token();
        data.SetValue("component_access_token", component_access_token);
        let url = `${Constant.WEIXIN_auth2_open_access_token}${data.ToUrl()}`;
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
        return await this.UseAccessTokenGetUserInfo();
    }

    private AssignmentObj(res: any): void {
        this._access_token = res.access_token;
        this._openid = res.openid;
        this._refresh_token = res.refresh_token;
        this._expires_in = res.expires_in;
    }

    private async UseAccessTokenGetUserInfo(): Promise<any> {
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
                return this.WeixinUserInfo;
            }
        }
    }

}