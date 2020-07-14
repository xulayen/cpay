import * as  cPay from '../wxPayApi';
import * as  cPay_Config from '../Config';
import * as  cPay_Exception from '../Exception/wxPayException';
import * as  cPay_Model from '../Model';
import { format, addMinutes } from 'date-fns';
import Constant from '../Config/constant';
import * as  cPay_Util from '../Util';
import { BaseRequest, IBaseWeixinInfo } from '../base';
import { WxOpenApi } from '../wxOpenApi';
import { CpayOpenBLL } from '../BLL/cPayBLL';
import { RedisKeyEnum } from '../Config/redisKey';

const WxPayData = cPay_Model.WxPayData;
const WxPayApi = cPay.WxPayApi;
const Util = cPay_Util.Util;
const WxPayException = cPay_Exception.WxPayException;

export class JssdkSign extends BaseRequest {

    private config: cPay_Config.IWxConfig;
    constructor(request?: any, response?: any, next?: any) {
        super(request, response, next);
        this.config = cPay_Config.Config.GetWxPayConfig();
    }

    /**
     * 获取JSSDK
     * @static
     * @param {string} appid 公众号APPID
     * @param {string} url 调用JSSDK的前端页面
     * @returns
     * @memberof JssdkSign
     */
    public async GetJSSDK(appid: string, url: string) {
        let data = await this.CalculateSign(appid, url), res = {
            noncestr: data.GetValue("noncestr"),
            timestamp: data.GetValue("timestamp"),
            signature: data.SHA1(),
            appid: appid
        };
        return res;
    }

    /**
     *
     * 获取Ticket
     * @private
     * @param {string} appid
     * @returns {Promise<string>}
     * @memberof JssdkSign
     */
    private async GetJsSdkTicket(appid: string): Promise<string> {
        let oauth = await CpayOpenBLL.SelectByAppidAndCappid(appid, this.config.GetOpenAppid()),
            token = oauth.access_token, url = Util.format(Constant.WEIXIN_OPEN_GET_JSsdk_ticket, token),
            redis_jssdk_t_key = cPay_Util.Util.format(RedisKeyEnum.redis_key_JSSDK_TICKET, this.config.GetOpenAppid(), appid);

        let jssdk_ticket = await cPay_Util.Util.redisClient.get(redis_jssdk_t_key);
        if (jssdk_ticket) {
            return jssdk_ticket;
        }

        let res = await Util.setMethodWithUri({
            url: url,
            method: 'get'
        });
        if (Util.IsString(res)) {
            res = JSON.parse(res);
        }

        if (res.errcode === 0) {
            jssdk_ticket = res.ticket;
            cPay_Util.Util.redisClient.set(redis_jssdk_t_key, res.ticket, res.expires_in - 1000);
        }

        return jssdk_ticket;

    }

    /**
     * 计算签名
     * @private
     * @static
     * @memberof JssdkSign
     */
    private async CalculateSign(appid: string, url: string): Promise<cPay_Model.WxPayData> {
        let data = new WxPayData(), jsticket = await this.GetJsSdkTicket(appid);
        data.SetValue("noncestr", WxPayApi.GenerateNonceStr());
        data.SetValue("jsapi_ticket", jsticket);
        data.SetValue("timestamp", WxPayApi.GenerateTimeStamp());
        data.SetValue("url", url);
        return data;
    }

}