"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WxPayException = void 0;
//export namespace cPay_Exception {
class WxPayException extends Error {
    constructor(message) {
        super(message);
    }
}
exports.WxPayException = WxPayException;
//}
