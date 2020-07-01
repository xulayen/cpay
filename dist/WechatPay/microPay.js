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
exports.MicroPay = void 0;
const cPay = require("../wxPayApi");
const cPay_Config = require("../Config");
const cPay_Exception = require("../Exception/wxPayException");
const cPay_Model = require("../Model");
const cPay_Util = require("../Util");
const basePay_1 = require("./basePay");
const WxPayData = cPay_Model.WxPayData;
const WxPayApi = cPay.WxPayApi;
const Util = cPay_Util.Util;
const WxPayException = cPay_Exception.WxPayException;
class MicroPay extends basePay_1.BasePay {
    constructor() {
        super();
        this.Config = cPay_Config.Config.GetWxPayConfig();
    }
    /**
     * 微信付款码支付 √
     *
     * @param {string} out_trade_no 商户系统内部订单号，要求32个字符内，只能是数字、大小写字母_-|*且在同一个商户号下唯一。
     * @param {string} auth_code 付款码，扫码支付付款码，设备读取用户微信中的条码或者二维码信息
     * @param {*} [options] 可选参数对象如{key:value}
     * @returns {Promise<cPay_Model.ResponseData>}
     * @memberof MicroPay
     */
    Scan(out_trade_no, auth_code, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let req = new cPay_Model.WxPayData();
            req.SetValue("body", this.orderInfo.body);
            req.SetValue("out_trade_no", out_trade_no);
            req.SetValue("total_fee", this.orderInfo.total_fee);
            req.SetValue("auth_code", auth_code);
            req.SetValue("attach", this.orderInfo.attach);
            for (let key in options) {
                req.SetValue(key, options[key]);
            }
            let result = yield WxPayApi.Micropay(req);
            //如果提交被扫支付接口调用失败，则抛异常
            if (!result.return_code || result.return_code === "FAIL") {
                let returnMsg = result.msg;
                throw new WxPayException("Micropay API interface call failure, return_msg : " + returnMsg);
            }
            //验签
            result.data.CheckSign(WxPayData.SIGN_TYPE_HMAC_SHA256);
            //刷卡支付直接成功
            if (result.return_code === "SUCCESS" && result.result_code === "SUCCESS") {
                return result;
            }
            /******************************************************************
             * 剩下的都是接口调用成功，业务失败的情况
             * ****************************************************************/
            if (result.err_code !== "USERPAYING" && result.err_code !== "SYSTEMERROR") {
                return result;
            }
            //不能确定是否失败，需用`out_trade_no`商户订单号去查单
            let queryTimes = 10; //查询次数计数器
            let orderInput = new WxPayData();
            orderInput.SetValue("out_trade_no", out_trade_no);
            while (queryTimes-- > 0) {
                let orderstates = yield WxPayApi.OrderQuery(orderInput);
                if (orderstates.return_code === 'SUCCESS' && orderstates.result_code === 'SUCCESS') {
                    if (orderstates.data.GetValue("trade_state") === 'SUCCESS') {
                        //支付成功
                        return orderstates;
                    }
                    else if (orderstates.data.GetValue("trade_state") === "USERPAYING") {
                        //用户支付中，需要继续查询
                        Util.sleep(10000);
                        continue;
                    }
                    else if ((orderstates.data.GetValue("trade_state") === "PAYERROR")) {
                        //支付失败，直接取消订单
                        break;
                    }
                }
                //如果返回错误码为“此交易订单号不存在”则直接认定失败
                if (orderstates.err_code === 'ORDERNOTEXIST') {
                    return result;
                }
                else {
                    //未失败，需要继续查询
                    Util.sleep(10000);
                    continue;
                }
            }
            //确认失败，取消订单
            let res_cannel = yield this.Cancel(orderInput);
            if (!res_cannel) {
                throw new WxPayException("MicroPay Reverse order failure");
            }
            return result;
        });
    }
    Cancel(orderInput, depth = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield WxPayApi.Reverse(orderInput);
            if (depth > 10) {
                //只重试10次
                return false;
            }
            //接口调用失败
            if (result.return_code !== "SUCCESS") {
                return false;
            }
            //如果结果为success且不需要重新调用撤销，则表示撤销成功
            if (result.result_code !== "SUCCESS" && result.data.GetValue("recall").toString() === "N") {
                return true;
            }
            else if (result.data.GetValue("recall").toString() == "Y") {
                //继续重试
                return this.Cancel(orderInput, ++depth);
            }
            return false;
        });
    }
}
exports.MicroPay = MicroPay;
