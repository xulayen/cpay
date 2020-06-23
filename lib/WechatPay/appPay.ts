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

/**
 * App支付
 */
export class AppPay extends BasePay {

    Config: cPay_Config.IWxConfig = cPay_Config.Config.GetWxPayConfig();
    constructor() {
        super();
    }

    /**
     * 统一下单
     * @param out_trade_no 商户系统内部订单号，要求32个字符内，只能是数字、大小写字母_-|*且在同一个商户号下唯一。
     * @param options 可选参数对象如{key:value}
     */
    public async UnifiedOrder(out_trade_no: string, options?: any): Promise<cPay_Model.ResponseData> {
        let req = new cPay_Model.WxPayData(), response_data = new cPay_Model.ResponseData();;
        req.SetValue("trade_type", Constant.WEIXIN_trade_type_APP);
        req.SetValue("out_trade_no", out_trade_no);
        req.SetValue("body", this.orderInfo.body);
        req.SetValue("total_fee", this.orderInfo.total_fee);
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
     * 获取app支付参数
     * @returns {{}} 参数对象
     * @memberof WxaPay
     */
    public GetAppApiPayParameters(): {} {
        console.log("App支付ApiPay::GetAppApiPayParameters is processing...");
        let apiParam = new WxPayData();
        apiParam.SetValue("appid", this.Config.GetAppID());
        apiParam.SetValue("partnerid", this.Config.GetMchID());
        apiParam.SetValue("prepayid", this.UnifiedOrderResult.GetValue("prepay_id"));
        apiParam.SetValue("package", "Sign=WXPay");
        apiParam.SetValue("nonceStr", WxPayApi.GenerateNonceStr());
        apiParam.SetValue("timeStamp", WxPayApi.GenerateTimeStamp());
        apiParam.SetValue("signType", WxPayData.SIGN_TYPE_HMAC_SHA256);
        apiParam.SetValue("sign", apiParam.MakeSign());
        let param = apiParam.ToJson();
        console.log(`App支付ApiPay::GetAppApiPayParameters :`);
        console.log(param);
        return param;
    }



}