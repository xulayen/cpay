import { BaseRequest } from '../base';
import { AliPayApi } from '../aliPayApi';
import * as Model from '../Model';

/**
 * 当面付
 *
 * @export
 * @class MicroPay
 * @extends {BaseRequest}
 */
export class MicroPay extends BaseRequest {

    constructor(request?: any, response?: any, next?: any) {
        super(request, response, next);
    }

    /**
     * 当面付
     * @param {string} out_trade_no 商户订单号
     * @param {string} scene 条码支付，取值：bar_code
                            声波支付，取值：wave_code
     * @param {string} auth_code 支付授权码，25~30开头的长度为16~24位的数字，实际字符串长度以开发者获取的付款码长度为准
     * @param {string} subject 订单标题
     * @param {*} [options] 可选参数，如{key:value}
     * @returns
     * @memberof MicroPay
     */
    public async UnifiedOrder(out_trade_no: string, scene: string, auth_code: string, subject: string, options?: any) {
        let inputObj = new Model.WxPayData();
        inputObj.SetValue("out_trade_no", out_trade_no);
        inputObj.SetValue("scene", scene);
        inputObj.SetValue("auth_code", auth_code)
        inputObj.SetValue("subject", subject)
        for (let key in options) {
            inputObj.SetValue(key, options[key]);
        }
        let res = await AliPayApi.UnifiedOrder(inputObj);
        return res;
    }

}