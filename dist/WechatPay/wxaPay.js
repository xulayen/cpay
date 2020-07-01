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
exports.WxaPay = void 0;
const cPay = require("../wxPayApi");
const cPay_Config = require("../Config");
const cPay_Exception = require("../Exception/wxPayException");
const cPay_Model = require("../Model");
const constant_1 = require("../Config/constant");
const cPay_Util = require("../Util");
const basePay_1 = require("./basePay");
const WxPayData = cPay_Model.WxPayData;
const WxPayApi = cPay.WxPayApi;
const Util = cPay_Util.Util;
const WxPayException = cPay_Exception.WxPayException;
const Config = cPay_Config.Config.GetWxPayConfig();
/**
 *
 * 小程序支付
 * @export
 * @class WxaPay
 */
class WxaPay extends basePay_1.BasePay {
    constructor() {
        super();
    }
    /**
     *
     * 小程序统一下单 √
     * @param {string} out_trade_no 商户系统内部订单号，要求32个字符内，只能是数字、大小写字母_-|*且在同一个商户号下唯一。
     * @param {string} openid 用户openid
     * @param {*} [options] 可选参数对象如{key:value}
     * @returns {Promise<cPay_Model.ResponseData>}
     * @memberof WxaPay
     */
    UnifiedOrder(out_trade_no, openid, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let req = new cPay_Model.WxPayData(), response_data = new cPay_Model.ResponseData();
            req.SetValue("trade_type", constant_1.default.WEIXIN_trade_type_JSAPI);
            req.SetValue("out_trade_no", out_trade_no);
            req.SetValue("body", this.orderInfo.body);
            req.SetValue("total_fee", this.orderInfo.total_fee);
            req.SetValue("openid", openid);
            for (let key in options) {
                req.SetValue(key, options[key]);
            }
            let result = yield WxPayApi.UnifiedOrder(req);
            this.UnifiedOrderResult = result;
            response_data.data = result;
            response_data.return_code = result.m_values.get("return_code");
            response_data.msg = result.m_values.get("return_msg");
            response_data.result_code = result.m_values.get("result_code");
            return response_data;
        });
    }
    /**
     * 获取小程序支付参数
     * @returns {{}} 参数对象
     * @memberof WxaPay
     */
    GetWxaApiPayParameters() {
        console.log("小程序ApiPay::GetWxaApiParam is processing...");
        let apiParam = new WxPayData();
        apiParam.SetValue("timeStamp", WxPayApi.GenerateTimeStamp());
        apiParam.SetValue("nonceStr", WxPayApi.GenerateNonceStr());
        apiParam.SetValue("package", "prepay_id=" + this.UnifiedOrderResult.GetValue("prepay_id"));
        apiParam.SetValue("signType", WxPayData.SIGN_TYPE_HMAC_SHA256);
        apiParam.SetValue("paySign", apiParam.MakeSign());
        let param = apiParam.ToJson();
        console.log(`小程序ApiPay::GetWxaApiParam :`);
        console.log(param);
        return param;
    }
}
exports.WxaPay = WxaPay;
