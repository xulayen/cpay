import * as  cPay_Model from '../Model';
export class BasePay {
    /**
     * 订单信息
     *
     * @type {cPay_Model.OrderInfo}
     * @memberof WxaPay
     */
    private _orderInfo: cPay_Model.OrderInfo;
    public get orderInfo(): cPay_Model.OrderInfo {
        if (!this._orderInfo) {
            throw new Error('提交订单前请先实例化订单信息！：OrderInfo');
        }
        return this._orderInfo;
    }
    public set orderInfo(value: cPay_Model.OrderInfo) {
        this._orderInfo = value;
    }



    private _UnifiedOrderResult: cPay_Model.WxPayData;
    protected get UnifiedOrderResult(): cPay_Model.WxPayData {
        if (!this._UnifiedOrderResult || !this._UnifiedOrderResult.IsSet("prepay_id")) {
            throw new Error("请先正确执行下单操作！");
        }
        return this._UnifiedOrderResult;
    }
    protected set UnifiedOrderResult(value: cPay_Model.WxPayData) {
        this._UnifiedOrderResult = value;
    }


    constructor() {

    }
}