"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePay = void 0;
class BasePay {
    constructor() {
    }
    get orderInfo() {
        if (!this._orderInfo) {
            throw new Error('提交订单前请先实例化订单信息！：OrderInfo');
        }
        return this._orderInfo;
    }
    set orderInfo(value) {
        this._orderInfo = value;
    }
    get UnifiedOrderResult() {
        if (!this._UnifiedOrderResult || !this._UnifiedOrderResult.IsSet("prepay_id")) {
            throw new Error("请先正确执行下单操作！");
        }
        return this._UnifiedOrderResult;
    }
    set UnifiedOrderResult(value) {
        this._UnifiedOrderResult = value;
    }
    GetApiPayParameters() {
        return {};
    }
}
exports.BasePay = BasePay;
