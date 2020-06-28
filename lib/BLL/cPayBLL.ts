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

export class CpayOrderBLL {

    static readonly tablename = "t_cPay_order";
    static dal: DAL.DbHelper = DAL.DbHelper.instance;
    constructor() {

    }

    static async IncreasedOrder(order: any, facid: string): Promise<boolean> {
        let params_columns: string[] = [], columns: string[] = [], params: any = {}, res;

        params_columns.push(":facid");
        columns.push("facid");
        params.facid = facid;

        if (order.out_trade_no) {
            params_columns.push(':out_trade_no');
            columns.push("out_trade_no");
            params.out_trade_no = order.out_trade_no;
        }

        if (order.body) {
            params_columns.push(':body');
            columns.push("body");
            params.body = order.body;
        }

        if (order.attach) {
            params_columns.push(':attach');
            columns.push("attach");
            params.attach = order.attach;
        }

        if (order.detail) {
            params_columns.push(':detail');
            columns.push("detail");
            params.detail = order.detail;
        }

        if (order.fee_type) {
            params_columns.push(':fee_type');
            columns.push("fee_type");
            params.fee_type = order.fee_type;
        }

        if (order.total_fee) {
            params_columns.push(':total_fee');
            columns.push("total_fee");
            params.total_fee = order.total_fee;
        }

        if (order.goods_tag) {
            params_columns.push(':goods_tag');
            columns.push("goods_tag");
            params.goods_tag = order.goods_tag;
        }

        if (order.trade_type) {
            params_columns.push(':trade_type');
            columns.push("trade_type");
            params.trade_type = order.trade_type;
        }

        if (order.product_id) {
            params_columns.push(':product_id');
            columns.push("product_id");
            params.product_id = order.product_id;
        }

        if (order.openid) {
            params_columns.push(':openid');
            columns.push("openid");
            params.openid = order.openid;
        }

        if (order.return_code) {
            params_columns.push(':return_code');
            columns.push("return_code");
            params.return_code = order.return_code;
        }

        if (order.return_msg) {
            params_columns.push(':return_msg');
            columns.push("return_msg");
            params.return_msg = order.return_msg;
        }

        if (order.result_code) {
            params_columns.push(':result_code');
            columns.push("result_code");
            params.result_code = order.result_code;
        }

        if (order.err_code) {
            params_columns.push(':err_code');
            columns.push("err_code");
            params.err_code = order.err_code;
        }

        if (order.err_code_des) {
            params_columns.push(':err_code_des');
            columns.push("err_code_des");
            params.err_code_des = order.err_code_des;
        }


        // for (let key in order) {
        //     let value = order[key];
        //     params_columns.push(`:${key}`);
        //     columns.push(`${key}`);
        //     params[key] = value;
        // }

        res = await this.dal.insert(this.tablename, columns, params_columns, params);
        if (res.affectedRows > 0) {
            return true;
        }
        return false;

    }

    static async UpdateOrder(out_trade_no: string, orderRes: any): Promise<boolean> {
        
        let columns = ` return_code=:return_code,result_code=:result_code,err_code=:err_code,err_code_des=:err_code_des `,
            condition = ` out_trade_no=:out_trade_no `, params: any = {};
        // params.out_trade_no = out_trade_no;
        // params.return_code = orderRes.return_code ? orderRes.return_code : '';
        // params.result_code = orderRes.result_code ? orderRes.result_code : '';
        // params.err_code = orderRes.err_code ? orderRes.err_code : '';
        // params.err_code_des = orderRes.err_code_des ? orderRes.err_code_des : '';
        orderRes.out_trade_no=out_trade_no;
        params = this.BuildParameters(`${columns},${condition},`, orderRes);
        let res_order = await this.dal.update(this.tablename, columns, condition, params);
        return res_order.affectedRows > 0;
    }

    static async WxPayCallBack(orderRes: any): Promise<boolean> {

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
        return res_order.affectedRows > 0;
    }

    public static BuildParameters(params: string, orderRes: any): any {
        let res: any = {};
        let paramkey = params.match(/(?<=:).*?(?=,)/ig);
        for (let i = 0; i < paramkey.length; i++) {
            let key = paramkey[i].trim();
            res[key] = orderRes[key] ? orderRes[key] : '';
        }
        return res;


    }





}