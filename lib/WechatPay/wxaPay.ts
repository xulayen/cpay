import * as  cPay from '../wxPayApi';
import * as  cPay_Config from '../Config';
import * as  cPay_Exception from '../Exception/wxPayException';
import * as  cPay_Model from '../Model';
import { format, addMinutes } from 'date-fns';
import Constant from '../Config/constant';
import * as  cPay_Util from '../Util';
import { BasePay } from './basePay';

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
export class WxaPay extends BasePay {


    constructor() {
        super();
    }

    /**
     * 
     * 小程序统一下单
     * @param {string} out_trade_no 商户系统内部订单号，要求32个字符内，只能是数字、大小写字母_-|*且在同一个商户号下唯一。
     * @param {string} openid 用户openid
     * @param {*} [options] 可选参数对象如{key:value}
     * @returns {Promise<cPay_Model.ResponseData>}
     * @memberof WxaPay
     */
    public async UnifiedOrder(out_trade_no: string, openid: string, options?: any): Promise<cPay_Model.ResponseData> {

        let req = new cPay_Model.WxPayData(), response_data = new cPay_Model.ResponseData();
        req.SetValue("trade_type", Constant.WEIXIN_trade_type_JSAPI);
        req.SetValue("out_trade_no", out_trade_no);
        req.SetValue("body", this.orderInfo.body);
        req.SetValue("total_fee", this.orderInfo.total_fee);
        req.SetValue("openid", openid);
        for (let key in options) {
            req.SetValue(key, options[key]);
        }
        let result = await WxPayApi.UnifiedOrder(req);
        this.UnifiedOrderResult = result;
        response_data.data = result;
        response_data.return_code = result.m_values.get("return_code");
        response_data.msg = result.m_values.get("return_msg");
        response_data.result_code = result.m_values.get("result_code");
        return response_data;

    }

    /**
     * 获取小程序支付参数
     * @returns {{}} 参数对象
     * @memberof WxaPay
     */
    public GetWxaApiPayParameters(): {} {
        console.log("小程序ApiPay::GetWxaApiParam is processing...");
        let jsApiParam = new WxPayData();
        jsApiParam.SetValue("timeStamp", WxPayApi.GenerateTimeStamp());
        jsApiParam.SetValue("nonceStr", WxPayApi.GenerateNonceStr());
        jsApiParam.SetValue("package", "prepay_id=" + this.UnifiedOrderResult.GetValue("prepay_id"));
        jsApiParam.SetValue("signType", WxPayData.SIGN_TYPE_HMAC_SHA256);
        jsApiParam.SetValue("paySign", jsApiParam.MakeSign());
        let param = jsApiParam.ToJson();
        console.log(`小程序ApiPay::GetWxaApiParam :`);
        console.log(param);
        return param;
    }


}