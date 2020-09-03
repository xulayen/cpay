
import { BaseRequest } from '../base';
import { AliPayApi } from '../aliPayApi';
import * as Model from '../Model';

/**
 * 手机H5支付
 */
export class WapPay extends BaseRequest {

    constructor(request?: any, response?: any, next?: any) {
        super(request, response, next);
    }

    /**
     * 统一下单
     * @param out_trade_no 订单号
     * @param quit_url 应用回调地址
     * @param total_amount 订单总金额，单位为元，精确到小数点后两位，取值范围[0.01,100000000]
     * @param subject 标题
     * @param product_code 销售产品码，商家和支付宝签约的产品码
     * @param options  其他参数，格式如：{key:value,...}
     */
    public async UnifiedOrder(out_trade_no: string, quit_url: string, total_amount: number, subject: string, product_code: string, options?: any) {
        let inputObj = new Model.WxPayData();
        inputObj.SetValue("out_trade_no", out_trade_no);
        inputObj.SetValue("quit_url", quit_url);
        inputObj.SetValue("total_amount", total_amount);
        inputObj.SetValue("subject", subject);
        inputObj.SetValue("product_code", product_code)
        for (let key in options) {
            inputObj.SetValue(key, options[key]);
        }
        let res = await AliPayApi.WapPay(inputObj);
        return res;
    }



}