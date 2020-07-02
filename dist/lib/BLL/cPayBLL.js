"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CpayLogsBLL = exports.CpayOrderBLL = void 0;
const DAL = require("../DAL/dbHelper");
class BaseBLL {
    static BuildParameters(params, orderRes) {
        let res = {};
        let paramkey = params.match(/(?<=:).*?(?=,)/ig);
        for (let i = 0; i < paramkey.length; i++) {
            let key = paramkey[i].trim();
            res[key] = orderRes[key] ? orderRes[key] : '';
        }
        return res;
    }
    static BuildOrderParameters(params, orderRes, facid = null) {
        let params_data = {}, columns = [];
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
class CpayOrderBLL extends BaseBLL {
    constructor() {
        super();
    }
    static IncreasedOrder(order, facid) {
        return __awaiter(this, void 0, void 0, function* () {
            let params_columns = [
                ":facid", ":out_trade_no", ":body",
                ":attach", ":detail", ":fee_type", ":total_fee", ":goods_tag", ":trade_type",
                ":product_id", ":openid", ":return_code", ":return_msg", ":result_code", ":err_code",
                ":err_code_des"
            ], res;
            let { columns, params_data } = this.BuildOrderParameters(params_columns, order, facid);
            res = yield DAL.DbHelper.instance.insert(this.tablename, columns, params_columns, params_data);
            this.IncreasedOrderDetail(order, facid);
            return res.affectedRows > 0;
        });
    }
    static IncreasedOrderDetail(order, facid) {
        return __awaiter(this, void 0, void 0, function* () {
            let params_columns = [':facid', ':appid', ':mch_id', ':out_trade_no', ':transaction_id', ':device_info',
                ':nonce_str', ':sign', ':sign_type', ':body', ':detail', ':attach', ':fee_type', ':total_fee', ':spbill_create_ip',
                ':time_start', ':time_expire', ':goods_tag', ':notify_url', ':trade_type', ':product_id', ':limit_pay', ':openid',
                ':receipt', ':scene_info', ':return_code', ':return_msg', ':result_code', ':err_code', ':err_code_des'], res;
            let { columns, params_data } = this.BuildOrderParameters(params_columns, order, facid);
            res = yield DAL.DbHelper.instance.insert(this.tablename_order_detail, columns, params_columns, params_data);
            return res.affectedRows > 0;
        });
    }
    static UpdateOrder(out_trade_no, orderRes) {
        return __awaiter(this, void 0, void 0, function* () {
            let columns = ` return_code=:return_code,result_code=:result_code,err_code=:err_code,err_code_des=:err_code_des `, condition = ` out_trade_no=:out_trade_no `, params = {};
            orderRes.out_trade_no = out_trade_no;
            params = this.BuildParameters(`${columns},${condition},`, orderRes);
            let res_order = yield DAL.DbHelper.instance.update(this.tablename, columns, condition, params);
            return res_order.affectedRows > 0;
        });
    }
    static UpdateOrderDetail(out_trade_no, orderRes) {
        return __awaiter(this, void 0, void 0, function* () {
            let columns = ` transaction_id=:transaction_id,device_info=:device_info,detail=:detail,limit_pay=:limit_pay,openid=:openid,receipt=:receipt,scene_info=:scene_info,return_code=:return_code,return_msg=:return_msg,result_code=:result_code,err_code=:err_code,err_code_des=:err_code_des `, condition = ` out_trade_no=:out_trade_no `, params = {};
            orderRes.out_trade_no = out_trade_no;
            params = this.BuildParameters(`${columns},${condition},`, orderRes);
            let res_order = yield DAL.DbHelper.instance.update(this.tablename_order_detail, columns, condition, params);
            return res_order.affectedRows > 0;
        });
    }
    static WxPayCallBack(orderRes, facid) {
        return __awaiter(this, void 0, void 0, function* () {
            let columns = ` return_code=:return_code,result_code=:result_code,err_code=:err_code,err_code_des=:err_code_des,transaction_id=:transaction_id,openid=:openid `, condition = ` out_trade_no=:out_trade_no `, params = {};
            params = this.BuildParameters(`${columns},${condition},`, orderRes);
            let res_order = yield DAL.DbHelper.instance.update(this.tablename, columns, condition, params);
            this.UpdateOrderDetail(orderRes.out_trade_no, orderRes);
            return res_order.affectedRows > 0;
        });
    }
}
exports.CpayOrderBLL = CpayOrderBLL;
CpayOrderBLL.tablename = "t_cPay_order";
CpayOrderBLL.tablename_order_detail = "t_cPay_order_detail";
class CpayLogsBLL extends BaseBLL {
    constructor() {
        super();
    }
    static InsertLogs(inputRes) {
        return __awaiter(this, void 0, void 0, function* () {
            let params_columns = [':out_trade_no', ':req', ':response', ':uri', ':times'], res;
            let { columns, params_data } = this.BuildOrderParameters(params_columns, inputRes);
            res = yield DAL.DbHelper.instance.insert(this.tablename, columns, params_columns, params_data);
            return res.affectedRows > 0;
        });
    }
}
exports.CpayLogsBLL = CpayLogsBLL;
CpayLogsBLL.tablename = "t_cpay_logs";
