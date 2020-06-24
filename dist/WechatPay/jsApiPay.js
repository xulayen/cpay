"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsApiPay = void 0;
const cPay = require("../wxPayApi");
const cPay_Config = require("../Config");
const cPay_Exception = require("../Exception/wxPayException");
const date_fns_1 = require("date-fns");
const constant_1 = require("../Config/constant");
const cPay_Util = require("../Util");
const WxPayData = cPay.WxPayData;
const WxPayApi = cPay.WxPayApi;
const Util = cPay_Util.Util;
const WxPayException = cPay_Exception.WxPayException;
class JsApiPay {
    constructor(request, response, next) {
        this.request = request;
        this.response = response;
        this.next = next;
        this.config = cPay_Config.Config.GetWxPayConfig();
    }
    GetWeixinUserInfo(uri, silence = true) {
        return __awaiter(this, void 0, void 0, function* () {
            let code = this.request.query.code;
            if (code) {
                console.log("Get code : " + code);
                yield this.GetOpenidAndAccessTokenFromCode(code, uri);
            }
            else {
                let redirect_uri = this.config.GetRedirect_uri();
                let data = new WxPayData();
                data.SetValue("appid", this.config.GetAppID());
                data.SetValue("redirect_uri", redirect_uri);
                data.SetValue("response_type", "code");
                data.SetValue("scope", silence ? "snsapi_base" : "snsapi_userinfo");
                data.SetValue("state", `STATE#wechat_redirect`);
                //触发微信返回code码
                let url = `${constant_1.default.WEIXIN_auth2_authorize}${data.ToUrl()}`;
                console.log("Will Redirect to URL : " + url);
                this.response.redirect(url);
            }
        });
    }
    UnifiedOrder(orderInfo, openid) {
        return __awaiter(this, void 0, void 0, function* () {
            //统一下单
            let data = new WxPayData();
            data.SetValue("body", orderInfo.body);
            data.SetValue("attach", orderInfo.attach);
            data.SetValue("out_trade_no", WxPayApi.GenerateOutTradeNo());
            data.SetValue("total_fee", orderInfo.total_fee);
            data.SetValue("time_start", date_fns_1.format(new Date(), "yyyyMMddHHmmss"));
            data.SetValue("time_expire", date_fns_1.format(date_fns_1.addMinutes(new Date(), 10), "yyyyMMddHHmmss"));
            data.SetValue("goods_tag", orderInfo.goods_tag);
            data.SetValue("trade_type", constant_1.default.WEIXIN_trade_type_JSAPI);
            data.SetValue("openid", openid);
            let result = yield WxPayApi.UnifiedOrder(data);
            if (!result.IsSet("appid") || !result.IsSet("prepay_id") || result.GetValue("prepay_id").toString() == "") {
                console.log("UnifiedOrder response error!");
                throw new WxPayException("UnifiedOrder response error!");
            }
            this._unifiedOrderResult = result;
            return result;
        });
    }
    GetJsApiPayParameters() {
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
    GetOpenidAndAccessTokenFromCode(code, uri) {
        return __awaiter(this, void 0, void 0, function* () {
            //构造获取openid及access_token的url
            let data = new WxPayData();
            data.SetValue("appid", this.config.GetAppID());
            data.SetValue("secret", this.config.GetAppSecret());
            data.SetValue("code", code);
            data.SetValue("grant_type", "authorization_code");
            let url = `${constant_1.default.WEIXIN_auth2_access_token}${data.ToUrl()}`;
            console.log(`获取access_token-request: \n${url}`);
            let res = yield Util.setMethodWithUri({
                url: url,
                method: 'get'
            });
            console.log(`获取access_token-response: \n${res}`);
            res = JSON.parse(res);
            if (res.errcode && res.errcode > 0)
                return;
            this.AssignmentObj(res);
            yield this.UseAccessTokenGetUserInfo();
            this.response.redirect(`${uri}?data=${JSON.stringify(this.WeixinUserInfo)}`);
        });
    }
    AssignmentObj(res) {
        this._access_token = res.access_token;
        this._openid = res.openid;
        this._refresh_token = res.refresh_token;
        this._expires_in = res.expires_in;
    }
    UseAccessTokenGetUserInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            //  let r_access_token = await redisclient.get(Redis_KEY_access_token);
            let data = new WxPayData();
            data.SetValue("access_token", this._access_token);
            data.SetValue("openid", this._openid);
            data.SetValue("lang", "zh_CN");
            if (this._access_token) {
                let url = `${constant_1.default.WEIXIN_auth2_userinfo}${data.ToUrl()}`;
                console.log(`使用access_token-获取微信信息-request: \n${url}`);
                let res = yield Util.setMethodWithUri({
                    url: url,
                    method: 'get'
                });
                console.log(`使用access_token-获取微信信息-response: \n${res}`);
                res = JSON.parse(res);
                if (res.errcode && res.errcode > 0) {
                    return false;
                }
                else {
                    this.WeixinUserInfo = new WeixinUserInfo();
                    this.WeixinUserInfo = res;
                }
                return true;
            }
        });
    }
}
exports.JsApiPay = JsApiPay;
class WeixinUserInfo {
    constructor() {
    }
}
