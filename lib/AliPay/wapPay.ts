
import { BaseRequest } from '../base';
import { AliPayApi } from '../aliPayApi';
import * as Model from '../Model';

export class WapPay extends BaseRequest {

    constructor(request?: any, response?: any, next?: any) {
        super(request, response, next);
    }

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
        let res = await AliPayApi.UnifiedOrder(inputObj);
        return res;
    }



}