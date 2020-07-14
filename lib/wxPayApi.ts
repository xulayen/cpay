import * as cPay_Config from './Config';
import * as  cPay_Util from './Util';
import { format } from 'date-fns';
import * as cPay_Exception from './Exception/wxPayException';
import Constant from './Config/constant';
import * as Model from './Model';
import * as BLL from './BLL/cPayBLL';

const Util = cPay_Util.Util;
const WxPayConfig = cPay_Config.Config;
const WxPayException = cPay_Exception.WxPayException;


class BaseApi {
    /**
     * 随机生成时间戳
     *
     * @static
     * @returns {string}
     * @memberof BaseApi
     */
    public static GenerateTimeStamp(): string {
        return (new Date().getTime() + Math.ceil(Math.random() * 1000)) + "";
    }

    /**
    * 生成随机串，随机串包含字母或数字
    * @return 随机串
    */
    public static GenerateNonceStr(): string {
        return (new Date().getTime() + Math.ceil(Math.random() * 1000)) + "";
    }

    /**
     * 随机生成商户订单号
     *
     * @static
     * @returns {string} 订单号
     * @memberof BaseApi
     */
    public static GenerateOutTradeNo(): string {
        return `${format(new Date(), 'yyyyMMddHHmmss')}${Math.ceil(Math.random() * 1000)}`;
    }

    public static async Log(input: Model.WxPayData, output: any, uri: string, times: number = 0): Promise<void> {
        let out_trade_no = input.GetValue("out_trade_no").toString(), req_input = {
            out_trade_no: out_trade_no,
            req: input.ToXml(),
            response: output,
            uri: uri,
            times: times
        };
        await BLL.CpayLogsBLL.InsertLogs(req_input);
    }
}


export class WxPayApi extends BaseApi {

    /**
     * 
     * 统一下单
     * @static
     * @param {Model.WxPayData} inputObj
     * @returns {Promise<cPay.Model.WxPayData>}
     * @memberof WxPayApi
     */
    static async UnifiedOrder(inputObj: Model.WxPayData): Promise<Model.WxPayData> {
        //Util.redisClient.set("111111","88888888888888888888888888888888888888888");
        let url = Constant.WEIXIN_wxpay_unifiedorder;
        //检测必填参数
        if (!inputObj.IsSet("out_trade_no")) {
            throw new WxPayException("缺少统一支付接口必填参数out_trade_no！");
        }
        else if (!inputObj.IsSet("body")) {
            throw new WxPayException("缺少统一支付接口必填参数body！");
        }
        else if (!inputObj.IsSet("total_fee")) {
            throw new WxPayException("缺少统一支付接口必填参数total_fee！");
        }
        else if (!inputObj.IsSet("trade_type")) {
            throw new WxPayException("缺少统一支付接口必填参数trade_type！");
        }

        //关联参数
        if (inputObj.GetValue("trade_type").toString() == Constant.WEIXIN_trade_type_JSAPI && !inputObj.IsSet("openid")) {
            throw new WxPayException("统一支付接口中，缺少必填参数openid！trade_type为JSAPI时，openid为必填参数！");
        }
        if (inputObj.GetValue("trade_type").toString() == Constant.WEIXIN_trade_type_NATIVE && !inputObj.IsSet("product_id")) {
            throw new WxPayException("统一支付接口中，缺少必填参数product_id！trade_type为JSAPI时，product_id为必填参数！");
        }

        //异步通知url未设置，则使用配置文件中的url
        if (!inputObj.IsSet("notify_url")) {
            inputObj.SetValue("notify_url", WxPayConfig.GetWxPayConfig().GetNotifyUrl());//异步通知url
        }

        inputObj.SetValue("appid", WxPayConfig.GetWxPayConfig().GetAppID());//公众账号ID
        inputObj.SetValue("mch_id", WxPayConfig.GetWxPayConfig().GetMchID());//商户号
        inputObj.SetValue("spbill_create_ip", WxPayConfig.GetWxPayConfig().GetIp());//终端ip	  	    
        inputObj.SetValue("nonce_str", this.GenerateNonceStr());//随机字符串
        inputObj.SetValue("sign_type", Model.WxPayData.SIGN_TYPE_HMAC_SHA256);//签名类型
        //签名
        inputObj.SetValue("sign", inputObj.MakeSign());

        let xml = inputObj.ToXml();

        //异步执行插入
        BLL.CpayOrderBLL.IncreasedOrder(inputObj.ToJson(), WxPayConfig.GetWxPayConfig().GetFacID());

        console.log("WxPayApi", "统一下单 request : " + xml);
        let res = await Util.setMethodWithUri({
            url: url,
            method: 'post',
            data: xml,
            headers: {
                'content-type': 'text/xml'
            }
        });
        console.log("WxPayApi", "统一下单 response : " + res);
        this.Log(inputObj, res, url);

        let result = new Model.WxPayData();
        await result.FromXml(res);

        //异步执行修改
        BLL.CpayOrderBLL.UpdateOrder(inputObj.GetValue("out_trade_no"), result.ToJson());

        return result;
    }

    /**
     * 发送红包
     *
     * @static
     * @param {Model.WxPayData} inputObj
     * @returns {Promise<Model.ResponseData>}
     * @memberof WxPayApi
     */
    static async SendRedPack(inputObj: Model.WxPayData): Promise<Model.ResponseData> {
        let url = Constant.WEIXIN_wxpay_sendredpack, response_data = new Model.ResponseData();
        //检测必填参数
        if (!inputObj.IsSet("send_name")) {
            throw new WxPayException("发放红包接口接口必填参数send_name！");
        }
        else if (!inputObj.IsSet("re_openid")) {
            throw new WxPayException("发放红包接口接口必填参数re_openid！");
        }
        else if (!inputObj.IsSet("total_amount")) {
            throw new WxPayException("发放红包接口接口必填参数total_amount！");
        }
        else if (!inputObj.IsSet("total_num")) {
            throw new WxPayException("发放红包接口接口必填参数total_num！");
        }
        else if (!inputObj.IsSet("wishing")) {
            throw new WxPayException("发放红包接口接口必填参数wishing！");
        }
        else if (!inputObj.IsSet("act_name")) {
            throw new WxPayException("发放红包接口接口必填参数act_name！");
        }
        else if (!inputObj.IsSet("remark")) {
            throw new WxPayException("发放红包接口接口必填参数remark！");
        }

        inputObj.SetValue("nonce_str", WxPayApi.GenerateNonceStr());
        inputObj.SetValue("mch_billno", WxPayApi.GenerateOutTradeNo());
        inputObj.SetValue("mch_id", WxPayConfig.GetWxPayConfig().GetMchID());
        inputObj.SetValue("wxappid", WxPayConfig.GetWxPayConfig().GetAppID());
        inputObj.SetValue("client_ip", WxPayConfig.GetWxPayConfig().GetIp());

        inputObj.SetValue("sign", inputObj.MakeSign());
        let xml = inputObj.ToXml();

        console.log("WxPayApi", "红包发放 request : " + xml);
        let res = await Util.setMethodWithUri({
            url: url,
            method: 'post',
            data: xml,
            headers: {
                'content-type': 'text/xml'
            },
            cert: WxPayConfig.GetWxPayConfig().GetSSlCertPath(),
            password: WxPayConfig.GetWxPayConfig().GetSSlCertPassword()
        });
        console.log("WxPayApi", "红包发放 response : " + res);
        this.Log(inputObj, res, url);

        let result = new Model.WxPayData();
        await result.FromXml(res);
        response_data = this.Flatten(result);
        return response_data;
    }

    /**
     *
     * 查询订单
     * @static
     * @param {Model.WxPayData} inputObj
     * @returns {Promise<cPay.Model.WxPayData>}
     * @memberof WxPayApi
     */
    static async OrderQuery(inputObj: Model.WxPayData): Promise<Model.ResponseData> {
        let url = Constant.WEIXIN_wxpay_orderquery, response_data = new Model.ResponseData();
        //检测必填参数
        if (!inputObj.IsSet("out_trade_no") && !inputObj.IsSet("transaction_id")) {
            throw new WxPayException("订单查询接口中，out_trade_no、transaction_id至少填一个！");
        }

        inputObj.SetValue("appid", WxPayConfig.GetWxPayConfig().GetAppID());//公众账号ID
        inputObj.SetValue("mch_id", WxPayConfig.GetWxPayConfig().GetMchID());//商户号
        inputObj.SetValue("nonce_str", WxPayApi.GenerateNonceStr());//随机字符串
        inputObj.SetValue("sign_type", Model.WxPayData.SIGN_TYPE_HMAC_SHA256);//签名类型
        inputObj.SetValue("sign", inputObj.MakeSign());//签名
        let xml = inputObj.ToXml();


        console.log(`查询订单-request: \n${xml}`);
        let res = await Util.setMethodWithUri({
            url: url,
            method: 'post',
            data: xml,
            headers: {
                'content-type': 'text/xml'
            }
        });
        console.log(`查询订单-response: \n${res}`);
        this.Log(inputObj, res, url);

        //将xml格式的数据转化为对象以返回
        let result = new Model.WxPayData();
        await result.FromXml(res);

        response_data.data = result;
        response_data.return_code = result.m_values.get("return_code");
        response_data.msg = result.m_values.get("return_msg");
        response_data.result_code = result.m_values.get("result_code");
        response_data.err_code = result.m_values.get("err_code");
        return response_data;
    }

    /**
     * 关闭订单
     * @static
     * @param {Model.WxPayData} inputObj
     * @returns {Promise<cPay.Model.WxPayData>}
     * @memberof WxPayApi
     */
    static async CloseOrder(inputObj: Model.WxPayData): Promise<Model.ResponseData> {
        let url = Constant.WEIXIN_wxpay_closeorder, response_data = new Model.ResponseData();
        //检测必填参数
        if (!inputObj.IsSet("out_trade_no")) {
            throw new WxPayException("关闭订单接口中，out_trade_no必填！");
        }
        inputObj.SetValue("appid", WxPayConfig.GetWxPayConfig().GetAppID());//公众账号ID
        inputObj.SetValue("mch_id", WxPayConfig.GetWxPayConfig().GetMchID());//商户号
        inputObj.SetValue("nonce_str", WxPayApi.GenerateNonceStr());//随机字符串		
        inputObj.SetValue("sign_type", Model.WxPayData.SIGN_TYPE_HMAC_SHA256);//签名类型
        inputObj.SetValue("sign", inputObj.MakeSign());//签名
        let xml = inputObj.ToXml();
        console.log(`关闭订单-request: \n${xml}`);
        let res = await Util.setMethodWithUri({
            url: url,
            method: 'post',
            data: xml,
            headers: {
                'content-type': 'text/xml'
            }
        });
        console.log(`关闭订单-response: \n${res}`);
        this.Log(inputObj, res, url);

        let result = new Model.WxPayData();
        await result.FromXml(res);
        response_data.data = result;
        response_data.return_code = result.m_values.get("return_code");
        response_data.msg = result.m_values.get("return_msg");
        response_data.result_code = result.m_values.get("result_code");
        response_data.err_code = result.m_values.get("err_code");
        return response_data;
    }

    /**
     * 申请退款
     *
     * @static
     * @param {Model.WxPayData} inputObj
     * @returns {Promise<cPay.Model.WxPayData>}
     * @memberof WxPayApi
     */
    static async Refund(inputObj: Model.WxPayData): Promise<Model.ResponseData> {
        let url = Constant.WEIXIN_wxpay_refund, response_data = new Model.ResponseData();
        //检测必填参数
        if (!inputObj.IsSet("out_trade_no") && !inputObj.IsSet("transaction_id")) {
            throw new WxPayException("退款申请接口中，out_trade_no、transaction_id至少填一个！");
        }
        else if (!inputObj.IsSet("out_refund_no")) {
            throw new WxPayException("退款申请接口中，缺少必填参数out_refund_no！");
        }
        else if (!inputObj.IsSet("total_fee")) {
            throw new WxPayException("退款申请接口中，缺少必填参数total_fee！");
        }
        else if (!inputObj.IsSet("refund_fee")) {
            throw new WxPayException("退款申请接口中，缺少必填参数refund_fee！");
        }
        else if (!inputObj.IsSet("op_user_id")) {
            throw new WxPayException("退款申请接口中，缺少必填参数op_user_id！");
        }
        inputObj.SetValue("appid", WxPayConfig.GetWxPayConfig().GetAppID());//公众账号ID
        inputObj.SetValue("mch_id", WxPayConfig.GetWxPayConfig().GetMchID());//商户号
        inputObj.SetValue("nonce_str", WxPayApi.GenerateNonceStr());//随机字符串
        inputObj.SetValue("sign_type", Model.WxPayData.SIGN_TYPE_HMAC_SHA256);//签名类型
        inputObj.SetValue("sign", inputObj.MakeSign());//签名
        let xml = inputObj.ToXml();
        console.log(`申请退款-request: \n${xml}`);
        let res = await Util.setMethodWithUri({
            url: url,
            method: 'post',
            data: xml,
            headers: {
                'content-type': 'text/xml'
            },
            cert: WxPayConfig.GetWxPayConfig().GetSSlCertPath(),
            password: WxPayConfig.GetWxPayConfig().GetSSlCertPassword()
        });
        console.log(`申请退款-response: \n${res}`);
        this.Log(inputObj, res, url);

        let result = new Model.WxPayData();
        await result.FromXml(res);
        response_data.data = result;
        response_data.return_code = result.m_values.get("return_code");
        response_data.msg = result.m_values.get("return_msg");
        response_data.result_code = result.m_values.get("result_code");
        response_data.err_code = result.m_values.get("err_code");
        return response_data;
    }

    /**
    * 查询退款
    * @static
    * @param {cPay.Model.WxPayData} inputObj
    * @returns {Promise<cPay.Model.WxPayData>}
    * @memberof WxPayApi
    */
    static async RefundQuery(inputObj: Model.WxPayData): Promise<Model.ResponseData> {
        let url = Constant.WEIXIN_wxpay_refundquery, response_data = new Model.ResponseData();
        //检测必填参数
        if (!inputObj.IsSet("out_refund_no") && !inputObj.IsSet("out_trade_no") &&
            !inputObj.IsSet("transaction_id") && !inputObj.IsSet("refund_id")) {
            throw new WxPayException("退款查询接口中，out_refund_no、out_trade_no、transaction_id、refund_id四个参数必填一个！");
        }

        inputObj.SetValue("appid", WxPayConfig.GetWxPayConfig().GetAppID());//公众账号ID
        inputObj.SetValue("mch_id", WxPayConfig.GetWxPayConfig().GetMchID());//商户号
        inputObj.SetValue("nonce_str", WxPayApi.GenerateNonceStr());//随机字符串
        inputObj.SetValue("sign_type", Model.WxPayData.SIGN_TYPE_HMAC_SHA256);//签名类型
        inputObj.SetValue("sign", inputObj.MakeSign());//签名
        let xml = inputObj.ToXml();
        console.log(`查询退款-request: \n${xml}`);
        let res = await Util.setMethodWithUri({
            url: url,
            method: 'post',
            data: xml,
            headers: {
                'content-type': 'text/xml'
            }
        });
        console.log(`查询退款-response: \n${res}`);
        this.Log(inputObj, res, url);

        let result = new Model.WxPayData();
        await result.FromXml(res);
        response_data.data = result;
        response_data.return_code = result.m_values.get("return_code");
        response_data.msg = result.m_values.get("return_msg");
        response_data.result_code = result.m_values.get("result_code");
        response_data.err_code = result.m_values.get("err_code");
        return response_data;
    }


    /**
     * 短链接生成
     * @param inputObj 入参
     */
    static async ShortUrl(inputObj: Model.WxPayData): Promise<Model.ResponseData> {
        let url = Constant.WEIXIN_wxpay_shorturl, response_data = new Model.ResponseData();
        //检测必填参数
        if (!inputObj.IsSet("long_url")) {
            throw new WxPayException("需要转换的URL，签名用原串，传输需URL encode！");
        }

        inputObj.SetValue("appid", WxPayConfig.GetWxPayConfig().GetAppID());//公众账号ID
        inputObj.SetValue("mch_id", WxPayConfig.GetWxPayConfig().GetMchID());//商户号
        inputObj.SetValue("nonce_str", WxPayApi.GenerateNonceStr());//随机字符串	
        inputObj.SetValue("sign_type", Model.WxPayData.SIGN_TYPE_HMAC_SHA256);//签名类型
        inputObj.SetValue("sign", inputObj.MakeSign());//签名
        let xml = inputObj.ToXml();
        console.log(`短链接-request: \n${xml}`);
        let res = await Util.setMethodWithUri({
            url: url,
            method: 'post',
            data: xml,
            headers: {
                'content-type': 'text/xml'
            }
        });
        console.log(`短链接-response: \n${res}`);
        this.Log(inputObj, res, url);

        let result = new Model.WxPayData();
        await result.FromXml(res);
        response_data.data = result;
        response_data.return_code = result.m_values.get("return_code");
        response_data.msg = result.m_values.get("return_msg");
        response_data.result_code = result.m_values.get("result_code");
        response_data.err_code = result.m_values.get("err_code");
        return response_data;
    }

    /**
     * 付款码支付
     *
     * @static
     * @param {Model.WxPayData} inputObj 入参
     * @returns {Promise<Model.ResponseData>}
     * @memberof WxPayApi
     */
    static async Micropay(inputObj: Model.WxPayData): Promise<Model.ResponseData> {
        let url = Constant.WEIXIN_wxpay_micropay, response_data = new Model.ResponseData();
        //检测必填参数
        if (!inputObj.IsSet("body")) {
            throw new WxPayException("提交被扫支付API接口中，缺少必填参数body！");
        }
        else if (!inputObj.IsSet("out_trade_no")) {
            throw new WxPayException("提交被扫支付API接口中，缺少必填参数out_trade_no！");
        }
        else if (!inputObj.IsSet("total_fee")) {
            throw new WxPayException("提交被扫支付API接口中，缺少必填参数total_fee！");
        }
        else if (!inputObj.IsSet("auth_code")) {
            throw new WxPayException("提交被扫支付API接口中，缺少必填参数auth_code！");
        }

        inputObj.SetValue("spbill_create_ip", WxPayConfig.GetWxPayConfig().GetIp());//终端ip
        inputObj.SetValue("appid", WxPayConfig.GetWxPayConfig().GetAppID());//公众账号ID
        inputObj.SetValue("mch_id", WxPayConfig.GetWxPayConfig().GetMchID());//商户号
        inputObj.SetValue("nonce_str", BaseApi.GenerateNonceStr());//随机字符串
        inputObj.SetValue("sign_type", Model.WxPayData.SIGN_TYPE_HMAC_SHA256);//签名类型
        inputObj.SetValue("sign", inputObj.MakeSign());//签名
        let xml = inputObj.ToXml();

        console.log(`付款码支付-request: \n${xml}`);
        let res = await Util.setMethodWithUri({
            url: url,
            method: 'post',
            data: xml,
            headers: {
                'content-type': 'text/xml'
            }
        });
        console.log(`付款码支付-response: \n${res}`);
        this.Log(inputObj, res, url);

        let result = new Model.WxPayData();
        await result.FromXml(res);
        response_data = this.Flatten(result);
        return response_data;
    }


    /**
    * 
    * 撤销订单API接口
    * @param WxPayData inputObj 提交给撤销订单API接口的参数，out_trade_no和transaction_id必填一个
    * @throws WxPayException
    * @return 成功时返回API调用结果，其他抛异常
    */
    static async Reverse(inputObj: Model.WxPayData): Promise<Model.ResponseData> {
        let url = Constant.WEIXIN_wxpay_reverse, response_data = new Model.ResponseData();
        //检测必填参数
        if (!inputObj.IsSet("out_trade_no") && !inputObj.IsSet("transaction_id")) {
            throw new WxPayException("撤销订单API接口中，参数out_trade_no和transaction_id必须填写一个！");
        }
        inputObj.SetValue("appid", WxPayConfig.GetWxPayConfig().GetAppID());//公众账号ID
        inputObj.SetValue("mch_id", WxPayConfig.GetWxPayConfig().GetMchID());//商户号
        inputObj.SetValue("nonce_str", BaseApi.GenerateNonceStr());//随机字符串
        inputObj.SetValue("sign_type", Model.WxPayData.SIGN_TYPE_HMAC_SHA256);//签名类型
        inputObj.SetValue("sign", inputObj.MakeSign());//签名
        let xml = inputObj.ToXml();

        console.log(`撤销订单-request: \n${xml}`);
        let res = await Util.setMethodWithUri({
            url: url,
            method: 'post',
            data: xml,
            headers: {
                'content-type': 'text/xml'
            },
            cert: WxPayConfig.GetWxPayConfig().GetSSlCertPath(),
            password: WxPayConfig.GetWxPayConfig().GetSSlCertPassword()
        });
        console.log(`撤销订单-response: \n${res}`);
        let result = new Model.WxPayData();
        await result.FromXml(res);
        response_data = this.Flatten(result);
        return response_data;
    }

    private static Flatten(input: Model.WxPayData): Model.ResponseData {
        let target = new Model.ResponseData()
        target.data = input;
        target.return_code = input.GetValue("return_code");
        target.msg = input.GetValue("return_msg");
        target.result_code = input.GetValue("result_code");
        target.err_code = input.GetValue("err_code");
        return target;
    }
}





//}
