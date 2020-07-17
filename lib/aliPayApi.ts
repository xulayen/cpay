import * as cPay_Config from './Config';
import * as  cPay_Util from './Util';
import { format } from 'date-fns';
import * as cPay_Exception from './Exception/wxPayException';
import Constant from './Config/constant';
import * as Model from './Model';
import * as BLL from './BLL/cPayBLL';

import { AlipayBase } from './base';

const Util = cPay_Util.Util;
const WxPayException = cPay_Exception.WxPayException;

export class AliPayApi extends AlipayBase {

    /**
     * 统一收单交易支付接口
     *
     * @static
     * @memberof AliPayApi
     */
    public static async UnifiedOrder(inputObj: Model.WxPayData) {

        if (!inputObj.IsSet("out_trade_no")) {
            throw new WxPayException("缺少统一支付接口必填参数out_trade_no！");
        } else if (!inputObj.IsSet("scene")) {
            throw new WxPayException("缺少统一支付接口必填参数scene！条码支付，取值：bar_code；声波支付，取值：wave_code");
        } else if (!inputObj.IsSet("auth_code")) {
            throw new WxPayException("缺少统一支付接口必填参数auth_code！");
        } else if (!inputObj.IsSet("subject")) {
            throw new WxPayException("缺少统一支付接口必填参数subject！");
        }

        let biz_content = inputObj.ToJson(),
            method = Constant.ALIPAY_OPENAPI_method_trade_pay,
            data = this.StructureCommonParameter(method, biz_content),
            url = `${Constant.ALIPAY_OPENAPI}${encodeURI(data.ToUrl_Ali())}`;

        console.log("AliPayApi", "支付宝-统一收单交易支付 request : " + url);
        let res = await Util.setMethodWithUri({
            url: url,
            method: 'post'
        });
        console.log("AliPayApi", "支付宝-统一收单交易支付 response : " );
        console.log(res);
        

        return res;

    }

}