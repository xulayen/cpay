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
exports.DbHelper = void 0;
const cPay_Config = require("../Config");
const mysql = require('mysql');
class DbHelper {
    constructor() {
        this.connection = mysql.createConnection({
            host: cPay_Config.Config.GetMySqlConfig().host,
            user: cPay_Config.Config.GetMySqlConfig().user,
            password: cPay_Config.Config.GetMySqlConfig().password,
            database: cPay_Config.Config.GetMySqlConfig().database
        });
        this.connection.connect(function (err) {
            if (err) {
                console.warn('error connecting: ' + err.message);
                return;
            }
        });
        this.connection.config.queryFormat = (query, values) => {
            if (!values)
                return query;
            return query.replace(/\:(\w+)/g, function (txt, key) {
                if (values.hasOwnProperty(key)) {
                    return mysql.escape(values[key]);
                }
                return txt;
            }.bind(this));
        };
    }
    static get instance() {
        if (!DbHelper._instance) {
            DbHelper._instance = new DbHelper();
        }
        return DbHelper._instance;
    }
    /**
     * 查询
     * @param tablename 数据表明
     * @param condition 查询条件,如 title=:title [and]
     * @param params 参数值，格式如{title:"标题"}
     * @param columns  查询字段，默认*
     */
    select(tablename, columns, condition, params) {
        return __awaiter(this, void 0, void 0, function* () {
            let sql = `select ${columns.length > 0 ? columns.join(',') : "*"} from ${tablename} x where ${condition.trim() ? condition : "1=1"}`, res = yield new Promise((resolve, reject) => {
                this.connection.query(sql, params, function (error, results, fields) {
                    if (error) {
                        reject(error);
                    }
                    ;
                    return resolve(results);
                });
            }).catch((e) => {
                console.error(e);
            });
            return res;
        });
    }
    /**
     * 插入
     * @param tablename 数据表名称
     * @param columns 列名，如["id","name"]
     * @param params_columns 参数列名，如[":id",":name"]
     * @param params 参数数据，如{"id":"1","name":"测试"}
     */
    insert(tablename, columns, params_columns, params) {
        return __awaiter(this, void 0, void 0, function* () {
            let sql = `insert into ${tablename} (${columns.join(',')}) values ( ${params_columns.join(',')} )`, res = yield new Promise((resolve, reject) => {
                this.connection.query(sql, params, function (error, results, fields) {
                    if (error) {
                        reject(error);
                    }
                    ;
                    return resolve(results);
                });
            }).catch((e) => {
                console.error(e);
            });
            return res;
        });
    }
    /**
     * 修改
     * @param tablename 数据表名称
     * @param columns 列名，如FirstName = :FirstName
     * @param condition 参数，如LastName = :LastName
     * @param params 参数，如{FirstName:"x",LastName:'l'}
     */
    update(tablename, columns, condition, params) {
        return __awaiter(this, void 0, void 0, function* () {
            let sql = `update ${tablename} set ${columns} where ${condition}`, res = yield new Promise((resolve, reject) => {
                this.connection.query(sql, params, function (error, results, fields) {
                    if (error) {
                        reject(error);
                    }
                    ;
                    return resolve(results);
                });
            }).catch((e) => {
                console.error(e);
            });
            return res;
        });
    }
    /**
    * 删除
    * @param tablename 数据表名称
    * @param condition 参数，如LastName = :LastName
    * @param params 参数，如{FirstName:"x",LastName:'l'}
    */
    delete(tablename, condition, params) {
        return __awaiter(this, void 0, void 0, function* () {
            let sql = `delete from ${tablename} where ${condition.trim() ? condition : "1=1"}`, res = yield new Promise((resolve, reject) => {
                this.connection.query(sql, params, function (error, results, fields) {
                    if (error) {
                        reject(error);
                    }
                    ;
                    return resolve(results);
                });
            }).catch((e) => {
                console.error(e);
            });
            return res;
        });
    }
    /**
     * 执行SQL
     * @param sql SQL语句
     * @param params 参数
     */
    execute(sql, params) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield new Promise((resolve, reject) => {
                this.connection.query(sql, params, function (error, results, fields) {
                    if (error) {
                        reject(error);
                    }
                    ;
                    return resolve(results);
                });
            }).catch((e) => {
                console.error(e);
            });
            return res;
        });
    }
}
exports.DbHelper = DbHelper;
