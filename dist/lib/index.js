"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Model = require("./Model");
const jsApiPay_1 = require("./WechatPay/jsApiPay");
const nativePay_1 = require("./WechatPay/nativePay");
const h5Pay_1 = require("./WechatPay/h5Pay");
const wxaPay_1 = require("./WechatPay/wxaPay");
const appPay_1 = require("./WechatPay/appPay");
const microPay_1 = require("./WechatPay/microPay");
const Config = require("./Config");
const Notify = require("./Notice");
const WxPayApi_1 = require("./WxPayApi");
const cPay = {
    JsApiPay: jsApiPay_1.JsApiPay,
    NativePay: nativePay_1.NativePay,
    H5Pay: h5Pay_1.H5Pay,
    WxaPay: wxaPay_1.WxaPay,
    AppPay: appPay_1.AppPay,
    MicroPay: microPay_1.MicroPay,
    Model,
    Config,
    Notify,
    BaseApi: WxPayApi_1.WxPayApi
};
exports.default = cPay;
