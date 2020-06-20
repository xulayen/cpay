import * as  cPay from '../wxPayApi';
import * as  cPay_Config from '../Config';
import * as  cPay_Model from '../Model';
import { format, addMinutes } from 'date-fns';
import Constant from '../Config/constant';
import * as cPay_Util from '../Util';
import { WxPayException } from 'lib/Exception/wxPayException';

//export namespace cPay_NativePay {

const WxPayData = cPay_Model.WxPayData;
const WxPayApi = cPay.WxPayApi;
const Util = cPay_Util.Util;

export class NativePay {

    config: any;
    constructor() {

        this.config = cPay_Config.Config.GetWxPayConfig();
    }

    public orderInfo: cPay_Model.OrderInfo;

    GetPrePayUrl(productId: string): string {
        console.log("Native pay mode 1 url is producing...");
        let data = new WxPayData();
        data.SetValue("appid", this.config.GetAppID());//公众帐号id
        data.SetValue("mch_id", this.config.GetMchID());//商户号
        data.SetValue("time_stamp", WxPayApi.GenerateTimeStamp());//时间戳
        data.SetValue("nonce_str", WxPayApi.GenerateNonceStr());//随机字符串
        data.SetValue("product_id", productId);//商品ID
        data.SetValue("sign", data.MakeSign());//签名
        let str = Util.ToUrlParams(data.GetValues());//转换为URL串
        let url = `${Constant.WEIXIN_wxpay_bizpayurl}${str}`;
        console.log("生成扫码支付模式1 : " + url);
        return url;
    }

    async GetPayUrl(productId: string): Promise<string> {
        console.log("Native pay mode 2 url is producing...");
        let data = new WxPayData(), url = "";
        data.SetValue("body", this.orderInfo.body);//商品描述
        data.SetValue("attach", this.orderInfo.attach);//附加数据
        data.SetValue("out_trade_no", WxPayApi.GenerateOutTradeNo());//随机字符串
        data.SetValue("total_fee", this.orderInfo.total_fee);//总金额
        data.SetValue("time_start", format(new Date(), "yyyyMMddHHmmss"));//交易起始时间
        data.SetValue("time_expire", format(addMinutes(new Date(), 10), "yyyyMMddHHmmss"));//交易结束时间
        data.SetValue("goods_tag", this.orderInfo.goods_tag);//商品标记
        data.SetValue("trade_type", Constant.WEIXIN_trade_type_NATIVE);//交易类型
        data.SetValue("product_id", productId);//商品ID
        let result = await WxPayApi.UnifiedOrder(data);//调用统一下单接口
        if (result.IsSet("code_url")) {
            url = result.GetValue("code_url").toString();//获得统一下单接口返回的二维码链接
            console.log("Get native pay mode 2 url : " + url);
            return url;
        }
        return result.IsSet("return_msg") && result.GetValue("return_msg");


    }
}



//}