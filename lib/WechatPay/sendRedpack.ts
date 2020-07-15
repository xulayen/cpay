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


    /**
     * 发送红包
     * @param {cPay_Model.RedPackInfo} redpack 红包对象
     * @param {*} [options] 可选参数对象如{key:value}
     * @returns {Promise<cPay_Model.ResponseData>}
     * @memberof SendRedpack
     */
    public async Send(redpack: cPay_Model.RedPackInfo, options?: any): Promise<cPay_Model.ResponseData> {
        let req = new cPay_Model.WxPayData(),
            response_data = new cPay_Model.ResponseData();
        req.SetValue("send_name", redpack.send_name);
        req.SetValue("re_openid", redpack.openid);
        req.SetValue("total_amount", redpack.total_amount);
        req.SetValue("total_num", 1);
        req.SetValue("wishing", redpack.wishing);
        req.SetValue("act_name", redpack.act_name);
        req.SetValue("remark", redpack.remark);
        if (redpack.scene_id) {
            req.SetValue("scene_id", redpack.scene_id);
        }
        for (let key in options) {
            req.SetValue(key, options[key]);
        }
        response_data = await WxPayApi.SendRedPack(req);
        return response_data;
    }

    /**
     * 企业零钱转账
     * @param {string} openid 微信openid
     * @param {number} amount 金额，单位：分
     * @param {string} desc 描述
     * @param {*} [options] 可选参数对象如{key:value}
     * @returns
     * @memberof SendRedpack
     */
    public async Transfer(openid: string, amount: number, desc: string, options?: any) {
        let req = new cPay_Model.WxPayData(),
            response_data = new cPay_Model.ResponseData();
        req.SetValue("openid", openid);
        req.SetValue("amount", amount);
        req.SetValue("desc", desc);
        for (let key in options) {
            req.SetValue(key, options[key]);
        }
        response_data = await WxPayApi.Transfers(req);
        return response_data;
    }



}