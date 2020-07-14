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
const Config: cPay_Config.IWxConfig = cPay_Config.Config.GetWxPayConfig();

/**
 * 红包发放类
 * @export
 * @class SendRedpack
 * @extends {BasePay}
 */
export class SendRedpack extends BasePay {

    constructor() {
        super();
    }


    public async Send(): Promise<cPay_Model.ResponseData> {

        let req = new cPay_Model.WxPayData(), response_data = new cPay_Model.ResponseData();
        


        req.SetValue("send_name", "中商网络");
        req.SetValue("re_openid", "oAU3pjt3cCaaqCm4jjVuB2kjuaXo");
        req.SetValue("total_amount", 1);
        req.SetValue("total_num", 1);
        req.SetValue("wishing", "恭喜发财！！！");
        req.SetValue("act_name", "红包活动！");
        req.SetValue("remark", "测试");


        return response_data;

    }



}