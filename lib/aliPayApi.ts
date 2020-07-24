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
    public static async UnifiedOrder(inputObj: Model.WxPayData): Promise<Model.ResponseResult<any>> {

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
            url = `${Constant.ALIPAY_OPENAPI}${data.ToUrl_Ali()}`,
            response = new Model.ResponseResult<any>();

        console.log("AliPayApi", "支付宝-统一收单交易支付 request : " + url);
        let res = await Util.setMethodWithUri({
            url: url,
            method: 'post'
        });
        console.log("AliPayApi", "支付宝-统一收单交易支付 response : ");
        console.log(res);
        res = JSON.parse(res);
        response.IsSuccess = res.alipay_trade_pay_response.code === 10000;
        response.ErrCode = res.alipay_trade_pay_response.code;
        response.SubErrCode = res.alipay_trade_pay_response.sub_code;
        response.ErrMessage = res.alipay_trade_pay_response.msg;
        response.ResponseData = res;
        return response;

    }

    /**
     * 手机H5支付
     *
     * @static
     * @param {Model.WxPayData} inputObj
     * @returns {Promise<Model.ResponseResult<any>>}
     * @memberof AliPayApi
     */
    public static async WapPay(inputObj: Model.WxPayData): Promise<Model.ResponseResult<any>> {
        if (!inputObj.IsSet("out_trade_no")) {
            throw new WxPayException("缺少统一支付接口必填参数out_trade_no！");
        } else if (!inputObj.IsSet("subject")) {
            throw new WxPayException("缺少统一支付接口必填参数subject！");
        } else if (!inputObj.IsSet("total_amount")) {
            throw new WxPayException("缺少统一支付接口必填参数total_amount！");
        } else if (!inputObj.IsSet("quit_url")) {
            throw new WxPayException("缺少统一支付接口必填参数quit_url！");
        } else if (!inputObj.IsSet("product_code")) {
            throw new WxPayException("缺少统一支付接口必填参数product_code！");
        }

        let biz_content = inputObj.ToJson(),
            method = Constant.ALIPAY_OPENAPI_method_wap_pay,
            data = this.StructureCommonParameter(method, biz_content),
            url = `${Constant.ALIPAY_OPENAPI}${data.ToUrl_Ali()}`,
            response = new Model.ResponseResult<any>();

        console.log("AliPayApi", "支付宝-手机H5支付 request : " + url);
        let res = await Util.setMethodWithUri({
            url: url,
            method: 'post'
        });
        console.log("AliPayApi", "支付宝-手机H5支付 response : ");
        console.log(res);
        res = JSON.parse(res);
        response.IsSuccess = res.alipay_trade_wap_pay_response.code === 10000;
        response.ErrCode = res.alipay_trade_wap_pay_response.code;
        response.SubErrCode = res.alipay_trade_wap_pay_response.sub_code;
        response.ErrMessage = res.alipay_trade_wap_pay_response.msg;
        response.ResponseData = res;
        return response;
    }
    //https://openapi.alipay.com/gateway.do?app_id=2021001180633158&biz_content={"out_trade_no":"1595581551371","scene":"wave_code","auth_code":"282828282222222222222222","subject":"测试"}&charset=utf-8&format=JSON&method=alipay.trade.pay&notify_url=http://cc.xulayen.com/&sign=EGL6sOvu5Hh/RhSlzUIbWZxEQMWkWlFhFtYObLtvCoC9Fr9U0aJkDm7BZA7wTcjMzti7nCKZpAoaYiFOSDKws4Z+QNEaWYnJYfBcShNdj1l3gjTVOQTXDIQXK1jcHl7wODYZs6EGYdYMh3vI99mGvBa1hrdruPrATF0gUfPpQn6cpxJVZx6cdjVQfEuKRrRppoGY6+Aztzidkg2dEgHebcYGcnwka8fj4yRQFC40rDBIZC3QHB9Q918qy6JcpKiwilfQh7KoIZ+qAORKNnKjO83ffhdsqqfO6xmHb7vnNYP0BMRmlIUz4qy1bozR8lO9742iwQNATDFXy0hHKEL7iA==&sign_type=RSA2&timestamp=2020-07-24 17:05:51&version=1.0
    //https://openapi.alipay.com/gateway.do?app_id=2021001180633158&biz_content={"out_trade_no":"1595581580781","quit_url":"http://baidu.com/","total_amount":100,"subject":"测试","product_code":"12121212121"}&charset=utf-8&format=JSON&method=alipay.trade.pay&notify_url=http://cc.xulayen.com/&sign=VJ1EB81C55swSIjeMx7o0jf1gJXQ3v0NTLOXOnLUJxzHeKdBODyn9isTl0LVX/ThiTX9BVvln5tu/b4IbfZvodv91Yg3j5F9EL8HjjvOIc5n0V1kO90qdthJ9k8BKpu3tqW7P7CkeuYs+ErIbXBQHWnfKRBJ9q/XKRpNHqgN0eEzycKUY2rsVUbt4tNWdWS2YjPk5SsJwKMU2VK1GF6KcP1nOfXVKnOuU87RCHcP8g8qn+xhXt3qSr8Ys0uQ8mLsjQL4YsqPejrstUGNWP77TPRsrGayREGApr3QoUoINiHtOptaJr3q2XFZVuIB4SlFHgsvRn2BQc25twspGbJRpQ==&sign_type=RSA2&timestamp=2020-07-24 17:06:20&version=1.0

}