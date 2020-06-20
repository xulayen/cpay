"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Model = require("./Model");
const jsApiPay_1 = require("./WechatPay/jsApiPay");
const nativePay_1 = require("./WechatPay/nativePay");
const Config = require("./Config");
const Notify = require("./Notice");
const cPay = {
    JsApiPay: jsApiPay_1.JsApiPay,
    NativePay: nativePay_1.NativePay,
    Model,
    Config,
    Notify
};
exports.default = cPay;
