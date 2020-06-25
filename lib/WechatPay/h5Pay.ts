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
 * H5页面发起微信支付
 *
 * @export
 * @class H5Pay
 */
export class H5Pay extends BasePay {


    constructor() {
        super();
    }

    /**
     *
     * H5下统一下单支付 √
     * @param {string} out_trade_no 商户系统内部订单号，要求32个字符内，只能是数字、大小写字母_-|*且在同一个商户号下唯一。
     * @param {cPay_Model.SceneInfo} scene WAP网站应用场景信息
     * @param {string} redirect_url 应用回调地址
     * @param {*} [options] 可选参数对象如{key:value}
     * @returns {Promise<cPay_Model.ResponseData>}
     * @memberof H5Pay
     */
    public async UnifiedOrder(out_trade_no: string, scene: cPay_Model.SceneInfo, redirect_url?: string, options?: any): Promise<cPay_Model.ResponseData> {
        if (!scene) {
            throw new WxPayException("缺少H5支付接口必填参数scene_info！");
        }
        let req = new cPay_Model.WxPayData(), response_data = new cPay_Model.ResponseData();;
        req.SetValue("trade_type", Constant.WEIXIN_trade_type_MWEB);
        req.SetValue("scene_info", JSON.stringify({ h5_info: scene }));
        req.SetValue("out_trade_no", out_trade_no);
        req.SetValue("body", this.orderInfo.body);
        req.SetValue("total_fee", this.orderInfo.total_fee);
        for (let key in options) {
            req.SetValue(key, options[key]);
        }
        let result = await WxPayApi.UnifiedOrder(req);
        if (redirect_url) {
            result.SetValue('mweb_url', `${result.GetValue("mweb_url").toString()}&redirect_url=${encodeURIComponent(redirect_url)}`);
        }
        response_data.data = result;
        response_data.return_code = result.m_values.get("return_code");
        response_data.msg = result.m_values.get("return_msg");
        response_data.result_code = result.m_values.get("result_code");
        return response_data;
    }




}