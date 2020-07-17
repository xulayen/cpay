import * as  cPay_Util from './Util';
import { format } from 'date-fns';
import * as Model from './Model';
import * as BLL from './BLL/cPayBLL';

const Util = cPay_Util.Util;

export class BaseRequest {

    protected request: any;
    protected response: any;
    protected next: any;
    constructor(request: any, response: any, next: any) {
        this.request = request;
        this.response = response;
        this.next = next;
    }

}

export interface IBaseWeixinInfo {
    WeixinUserInfo: Model.WeixinUserInfo;
}

export class BaseApi {
    /**
     * 随机生成时间戳
     *
     * @static
     * @returns {string}
     * @memberof BaseApi
     */
    public static GenerateTimeFormat(): string {
        return format(new Date(), "yyyy-MM-dd HH:mm:ss");
    }

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
        let out_trade_no = input.GetValue("out_trade_no").toString() || input.GetValue("mch_billno").toString(), req_input = {
            out_trade_no: out_trade_no,
            req: input.ToXml(),
            response: Util.IsObject(output) ? output.message : output,
            uri: uri,
            times: times
        };
        await BLL.CpayLogsBLL.InsertLogs(req_input);
    }
}

export class AlipayBase extends BaseApi {



    static StructureCommonParameter(method: string, biz_content: object, app_auth_token?: string): Model.WxPayData {
        let input = new Model.WxPayData();
        input.SetValue("app_id", "2021001180633158");
        input.SetValue("method", method);
        input.SetValue("format", "JSON");
        input.SetValue("charset", "utf-8");
        input.SetValue("sign_type", "RSA2");
        input.SetValue("timestamp", "2020-07-17 15:41:18");
        input.SetValue("version", "1.0");
        input.SetValue("notify_url", "http://baidu.com/");
        if (app_auth_token)
            input.SetValue("app_auth_token", app_auth_token);
        input.SetValue("biz_content", JSON.stringify(biz_content));
        input.SetValue("sign", input.MakeSign(Model.WxPayData.SIGN_TYPE_RSA2));
        return input;
    }
}