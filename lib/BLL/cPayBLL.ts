import * as DAL from '../DAL/dbHelper';

class BaseBLL {
    public static BuildParameters(params: string, orderRes: any): any {
        let res: any = {};
        let paramkey = params.match(/(?<=:).*?(?=,)/ig);
        for (let i = 0; i < paramkey.length; i++) {
            let key = paramkey[i].trim();
            res[key] = orderRes[key] ? orderRes[key] : '';
        }
        return res;
    }

    public static BuildParametersPlus(params: string[], orderRes: any, facid: string = null) {
        let params_data: any = {}, columns: string[] = [];
        let paramkey = `${params.join(',')},`.match(/(?<=:).*?(?=,)/ig);
        for (let i = 0; i < paramkey.length; i++) {
            let key = paramkey[i].trim();
            params_data[key] = orderRes[key] ? orderRes[key] : '';
            columns.push(key);
        }
        if (facid) {
            params_data.facid = facid;
        }
        return { columns, params_data };
    }
}

export class CpayOrderBLL extends BaseBLL {

    static readonly tablename = "t_cPay_order";
    static readonly tablename_order_detail = "t_cPay_order_detail";
    constructor() {
        super();
    }

    static async IncreasedOrder(order: any, facid: string): Promise<boolean> {
        let params_columns: string[] = [
            ":facid", ":out_trade_no", ":body",
            ":attach", ":detail", ":fee_type", ":total_fee", ":goods_tag", ":trade_type",
            ":product_id", ":openid", ":return_code", ":return_msg", ":result_code", ":err_code",
            ":err_code_des"
        ], res;

        let { columns, params_data } = this.BuildParametersPlus(params_columns, order, facid);
        res = await DAL.DbHelper.instance.insert(this.tablename, columns, params_columns, params_data);
        this.IncreasedOrderDetail(order, facid);
        return res && res.affectedRows > 0;

    }

    static async IncreasedOrderDetail(order: any, facid: string): Promise<boolean> {
        let params_columns: string[] = [':facid', ':appid', ':mch_id', ':out_trade_no', ':transaction_id', ':device_info',
            ':nonce_str', ':sign', ':sign_type', ':body', ':detail', ':attach', ':fee_type', ':total_fee', ':spbill_create_ip',
            ':time_start', ':time_expire', ':goods_tag', ':notify_url', ':trade_type', ':product_id', ':limit_pay', ':openid',
            ':receipt', ':scene_info', ':return_code', ':return_msg', ':result_code', ':err_code', ':err_code_des'], res;

        let { columns, params_data } = this.BuildParametersPlus(params_columns, order, facid);
        res = await DAL.DbHelper.instance.insert(this.tablename_order_detail, columns, params_columns, params_data);
        return res && res.affectedRows > 0;
    }

    static async UpdateOrder(out_trade_no: string, orderRes: any): Promise<boolean> {
        let columns = ` return_code=:return_code,result_code=:result_code,err_code=:err_code,err_code_des=:err_code_des `,
            condition = ` out_trade_no=:out_trade_no `, params: any = {};
        orderRes.out_trade_no = out_trade_no;
        params = this.BuildParameters(`${columns},${condition},`, orderRes);
        let res_order = await DAL.DbHelper.instance.update(this.tablename, columns, condition, params);
        return res_order && res_order.affectedRows > 0;
    }

    static async UpdateOrderDetail(out_trade_no: string, orderRes: any): Promise<boolean> {
        let columns = ` transaction_id=:transaction_id,device_info=:device_info,detail=:detail,limit_pay=:limit_pay,openid=:openid,receipt=:receipt,scene_info=:scene_info,return_code=:return_code,return_msg=:return_msg,result_code=:result_code,err_code=:err_code,err_code_des=:err_code_des `,
            condition = ` out_trade_no=:out_trade_no `, params: any = {};
        orderRes.out_trade_no = out_trade_no;
        params = this.BuildParameters(`${columns},${condition},`, orderRes);
        let res_order = await DAL.DbHelper.instance.update(this.tablename_order_detail, columns, condition, params);
        return res_order && res_order.affectedRows > 0;
    }

    static async WxPayCallBack(orderRes: any, facid: string): Promise<boolean> {
        let columns = ` return_code=:return_code,result_code=:result_code,err_code=:err_code,err_code_des=:err_code_des,transaction_id=:transaction_id,openid=:openid `,
            condition = ` out_trade_no=:out_trade_no `, params: any = {};
        params = this.BuildParameters(`${columns},${condition},`, orderRes);
        let res_order = await DAL.DbHelper.instance.update(this.tablename, columns, condition, params);
        this.UpdateOrderDetail(orderRes.out_trade_no, orderRes);
        return res_order && res_order.affectedRows > 0;
    }

}


export class CpayLogsBLL extends BaseBLL {

    static readonly tablename = "t_cpay_logs";
    constructor() {
        super();
    }

    public static async InsertLogs(inputRes: any) {

        let params_columns: string[] = [':out_trade_no', ':req', ':response', ':uri', ':times'], res;

        let { columns, params_data } = this.BuildParametersPlus(params_columns, inputRes);
        res = await DAL.DbHelper.instance.insert(this.tablename, columns, params_columns, params_data);
        return res && res.affectedRows > 0;

    }

}

class OpenAuth { appid: string; access_token: string; refresh_token: string; expires_in: number; expires_time: string; }

export class CpayOpenBLL extends BaseBLL {

    static readonly tablename = "t_cpay_open_authorization";
    static readonly tablename_AUTH_INFO = "t_cpay_open_authorization_info";
    constructor() {
        super();
    }

    public static async InsertOpenAuth(inputRes: OpenAuth): Promise<boolean> {
        let params_columns: string[] = [':appid', ':access_token', ':expires_in', ':refresh_token', ':expires_time',":component_appid"], res;
        let { columns, params_data } = this.BuildParametersPlus(params_columns, inputRes);
        res = await DAL.DbHelper.instance.insert(this.tablename, columns, params_columns, params_data);
        return res && res.affectedRows > 0;
    }

    public static async InsertOpenAuthInfo(inputRes: any): Promise<boolean> {
        let params_columns: string[] = [':appid', ':component_appid', ':nick_name', ':head_img', ':service_type_info', ':verify_type_info', ':user_name', ':principal_name', ':signature', ':alias', ':business_info', ':qrcode_url', ':miniprograminfo'], res;
        let { columns, params_data } = this.BuildParametersPlus(params_columns, inputRes);
        res = await DAL.DbHelper.instance.insert(this.tablename_AUTH_INFO, columns, params_columns, params_data);
        return res && res.affectedRows > 0;
    }

    public static async AppidHasAuth(appid: string): Promise<boolean> {
        let res = await DAL.DbHelper.instance.select(this.tablename, [], " appid=:appid ", { appid: appid });
        return res && res.length > 0;
    }

    /**
     * 查询出还有N分钟过期的Token数据集
     * @static
     * @param {number} [time=30] 默认30分钟
     * @returns
     * @memberof CpayOpenBLL
     */
    public static async SelectWillExpireToken(time: number = 30) {
        let res = await DAL.DbHelper.instance.execute(` select * from ${this.tablename} x where round((UNIX_TIMESTAMP(x.expires_time)-UNIX_TIMESTAMP(SYSDATE()))/60) < ${time} `);
        return res;
    }

    public static async UpdateWillExpireToken(inputRes: OpenAuth): Promise<Boolean> {
        console.log('开始更新：');
        let columns = ` access_token=:access_token,expires_in=:expires_in,refresh_token=:refresh_token,expires_time=:expires_time, appid=:appid, component_appid=:component_appid  `,
            condition = ` appid=:appid and component_appid=:component_appid `, params: any = {};
        params = this.BuildParameters(`${columns},`, inputRes);
        let res_order = await DAL.DbHelper.instance.update(this.tablename, columns, condition, params);
        console.log('更新完成：' + res_order.affectedRows);
        return res_order.affectedRows > 0;

    }


}