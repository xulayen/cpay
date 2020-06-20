import * as  cPay from '../wxPayApi';
import * as  cPay_Config from '../Config';
import * as  cPay_Exception from '../Exception/wxPayException';
import * as  cPay_Model from '../Model';
import { format, addMinutes } from 'date-fns';
import Constant from '../Config/constant';
import * as  cPay_Util from '../Util';

const WxPayData = cPay_Model.WxPayData;
const WxPayApi = cPay.WxPayApi;
const Util = cPay_Util.Util;
const WxPayException = cPay_Exception.WxPayException;

export class H5Pay {

    public orderInfo: cPay_Model.OrderInfo;

    constructor() {

    }

    /**
     * H5下统一下单支付参数
     * @param out_trade_no 商户订单号
     * @param scene WAP网站应用场景信息
     */
    public async UnifiedOrder(out_trade_no: string, scene: cPay_Model.SceneInfo): Promise<cPay_Model.ResponseData> {
        if (!scene) {
            throw new WxPayException("缺少H5支付接口必填参数scene_info！");
        }
        if (!out_trade_no) {
            throw new WxPayException("缺少H5支付接口必填参数out_trade_no！");
        }
        let req = new cPay_Model.WxPayData(), response_data = new cPay_Model.ResponseData();;
        req.SetValue("trade_type", Constant.WEIXIN_trade_type_MWEB);
        req.SetValue("scene_info", JSON.stringify({ h5_info: scene }));
        req.SetValue("out_trade_no", out_trade_no);
        req.SetValue("body", this.orderInfo.body);
        req.SetValue("total_fee", this.orderInfo.total_fee);
        let result = await WxPayApi.UnifiedOrder(req);
        response_data.data = result;
        response_data.return_code = result.m_values.get("return_code");
        response_data.msg = result.m_values.get("return_msg");
        response_data.result_code = result.m_values.get("result_code");
        return response_data;
    }




}