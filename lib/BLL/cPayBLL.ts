import * as DAL from '../DAL/dbHelper';
import { de } from 'date-fns/locale';


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

    static async IncreasedOrder(order: any,facid:string): Promise<boolean> {
        debugger;
        let columns: string[] = [], params: any={}, res;

        columns.push(":facid");
        params.facid=facid;

        if (order.out_trade_no) {
            columns.push(':out_trade_no');
            params.out_trade_no=order.out_trade_no;
        }

        if (order.body) {
            columns.push(':body');
            params.body=order.body;
        }

        if (order.attach) {
            columns.push(':attach');
            params.attach=order.attach;
        }

        if (order.detail) {
            columns.push(':detail');
            params.detail=order.detail;
        }

        if (order.fee_type) {
            columns.push(':fee_type');
            params.fee_type=order.fee_type;
        }

        if (order.total_fee) {
            columns.push(':total_fee');
            params.total_fee=order.total_fee;
        }

        if (order.goods_tag) {
            columns.push(':goods_tag');
            params.goods_tag=order.goods_tag;
        }

        if (order.trade_type) {
            columns.push(':trade_type');
            params.trade_type=order.trade_type;
        }

        if (order.product_id) {
            columns.push(':product_id');
            params.product_id=order.product_id;
        }

        if (order.openid) {
            columns.push(':openid');
            params.openid=order.openid;
        }

        if (order.return_code) {
            columns.push(':return_code');
            params.return_code=order.return_code;
        }

        if (order.return_msg) {
            columns.push(':return_msg');
            params.return_msg=order.return_msg;
        }

        if (order.result_code) {
            columns.push(':result_code');
            params.result_code=order.result_code;
        }

        if (order.err_code) {
            columns.push(':err_code');
            params.err_code=order.err_code;
        }

        if (order.err_code_des) {
            columns.push(':err_code_des');
            params.err_code_des=order.err_code_des;
        }


        // for (let key in order) {
        //     let value = order[key];
        //     columns.push(`:${key}`);
        //     params[key] = value;
        // }

        res = await this.dal.insert(this.tablename, columns, params);
        if (res.affectedRows > 0) {
            return true;
        }
        return false;

    }


}