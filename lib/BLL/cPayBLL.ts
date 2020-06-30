import * as DAL from '../DAL/dbHelper';
import { de, tr } from 'date-fns/locale';
import * as cPay_Util from '../Util';


export class CayConfigBLL {
    static readonly tablename = "t_cPay_config";
    static dal: DAL.DbHelper = DAL.DbHelper.instance;
    constructor() {

    }

    static async GetConfig(facid: string): Promise<any> {
        console.log(`GetConfig-${facid}`);
        let record = await this.dal.select(this.tablename, [], " facid=:facid ", { facid: facid });
        console.log(record);
        return record;
    }
}

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

    public static BuildOrderParameters(params: string[], orderRes: any, facid: string = null) {
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
    static dal: DAL.DbHelper = DAL.DbHelper.instance;
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

        let { columns, params_data } = this.BuildOrderParameters(params_columns, order, facid);
        res = await this.dal.insert(this.tablename, columns, params_columns, params_data);
        this.IncreasedOrderDetail(order, facid);
        return res.affectedRows > 0;

    }

    static async IncreasedOrderDetail(order: any, facid: string): Promise<boolean> {
        let params_columns: string[] = [':facid', ':appid', ':mch_id', ':out_trade_no', ':transaction_id', ':device_info',
            ':nonce_str', ':sign', ':sign_type', ':body', ':detail', ':attach', ':fee_type', ':total_fee', ':spbill_create_ip',
            ':time_start', ':time_expire', ':goods_tag', ':notify_url', ':trade_type', ':product_id', ':limit_pay', ':openid',
            ':receipt', ':scene_info', ':return_code', ':return_msg', ':result_code', ':err_code', ':err_code_des'], res;

        let { columns, params_data } = this.BuildOrderParameters(params_columns, order, facid);
        res = await this.dal.insert(this.tablename_order_detail, columns, params_columns, params_data);
        return res.affectedRows > 0;
    }

    static async UpdateOrder(out_trade_no: string, orderRes: any): Promise<boolean> {

        let columns = ` return_code=:return_code,result_code=:result_code,err_code=:err_code,err_code_des=:err_code_des `,
            condition = ` out_trade_no=:out_trade_no `, params: any = {};
        // params.out_trade_no = out_trade_no;
        // params.return_code = orderRes.return_code ? orderRes.return_code : '';
        // params.result_code = orderRes.result_code ? orderRes.result_code : '';
        // params.err_code = orderRes.err_code ? orderRes.err_code : '';
        // params.err_code_des = orderRes.err_code_des ? orderRes.err_code_des : '';
        orderRes.out_trade_no = out_trade_no;
        params = this.BuildParameters(`${columns},${condition},`, orderRes);
        let res_order = await this.dal.update(this.tablename, columns, condition, params);
        return res_order.affectedRows > 0;
    }

    static async UpdateOrderDetail(out_trade_no: string, orderRes: any): Promise<boolean> {

        let columns = ` transaction_id=:transaction_id,device_info=:device_info,detail=:detail,limit_pay=:limit_pay,openid=:openid,receipt=:receipt,scene_info=:scene_info,return_code=:return_code,return_msg=:return_msg,result_code=:result_code,err_code=:err_code,err_code_des=:err_code_des `,
            condition = ` out_trade_no=:out_trade_no `, params: any = {};
        // params.out_trade_no = out_trade_no;
        // params.return_code = orderRes.return_code ? orderRes.return_code : '';
        // params.result_code = orderRes.result_code ? orderRes.result_code : '';
        // params.err_code = orderRes.err_code ? orderRes.err_code : '';
        // params.err_code_des = orderRes.err_code_des ? orderRes.err_code_des : '';
        orderRes.out_trade_no = out_trade_no;
        params = this.BuildParameters(`${columns},${condition},`, orderRes);
        let res_order = await this.dal.update(this.tablename_order_detail, columns, condition, params);
        return res_order.affectedRows > 0;
    }

    static async WxPayCallBack(orderRes: any, facid: string): Promise<boolean> {

        let columns = ` return_code=:return_code,result_code=:result_code,err_code=:err_code,err_code_des=:err_code_des,transaction_id=:transaction_id,openid=:openid `,
            condition = ` out_trade_no=:out_trade_no `, params: any = {};
        // params.out_trade_no = orderRes.out_trade_no;
        // params.return_code = orderRes.return_code ? orderRes.return_code : '';
        // params.result_code = orderRes.result_code ? orderRes.result_code : '';
        // params.err_code = orderRes.err_code ? orderRes.err_code : '';
        // params.err_code_des = orderRes.err_code_des ? orderRes.err_code_des : '';
        // params.transaction_id = orderRes.transaction_id ? orderRes.transaction_id : '';
        // params.openid = orderRes.openid ? orderRes.openid : '';
        params = this.BuildParameters(`${columns},${condition},`, orderRes);
        let res_order = await this.dal.update(this.tablename, columns, condition, params);
        this.UpdateOrderDetail(orderRes.out_trade_no, orderRes);
        return res_order.affectedRows > 0;
    }



}


export class CpayLogsBLL extends BaseBLL {

    static readonly tablename = "t_cpay_logs";
    static dal: DAL.DbHelper = DAL.DbHelper.instance;
    constructor() {
        super();
    }

    public static async InsertLogs(inputRes: any) {

        let params_columns: string[] = [':out_trade_no', ':req', ':response', ':uri', ':times'], res;

        let { columns, params_data } = this.BuildOrderParameters(params_columns, inputRes);
        res = await this.dal.insert(this.tablename, columns, params_columns, params_data);
        return res.affectedRows > 0;

    }

}