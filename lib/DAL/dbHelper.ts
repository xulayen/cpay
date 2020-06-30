
import * as  cPay_Config from '../Config';
const mysql = require('mysql');

class DbHelper {

    private connection: any;
    private static _instance: DbHelper;
    static get instance(): DbHelper {
        if (!DbHelper._instance) {
            DbHelper._instance = new DbHelper();
        }
        return DbHelper._instance;
    }

    constructor() {
        this.connection = mysql.createConnection({
            host: cPay_Config.Config.GetMySqlConfig().host,
            user: cPay_Config.Config.GetMySqlConfig().user,
            password: cPay_Config.Config.GetMySqlConfig().password,
            database: cPay_Config.Config.GetMySqlConfig().database
        });

        this.connection.connect(function (err: any) {
            if (err) {
                console.warn('error connecting: ' + err.message);
                return;
            }
        });

        this.connection.config.queryFormat = (query: any, values: any) => {
            if (!values) return query;
            return query.replace(/\:(\w+)/g, function (txt: any, key: any) {
                if (values.hasOwnProperty(key)) {
                    return mysql.escape(values[key]);
                }
                return txt;
            }.bind(this));
        };

    }

    /**
     * 查询
     * @param tablename 数据表明
     * @param condition 查询条件,如 title=:title [and]
     * @param params 参数值，格式如{title:"标题"}
     * @param columns  查询字段，默认*
     */
    async select(tablename: string, columns?: [], condition?: string, params?: {}): Promise<any> {
        let sql = `select ${columns.length > 0 ? columns.join(',') : "*"} from ${tablename} x where ${condition.trim() ? condition : "1=1"}`,
            res = await new Promise((resolve, reject) => {
                this.connection.query(sql, params, function (error: any, results: any, fields: any) {
                    if (error) {
                        reject(error);
                    };
                    return resolve(results);
                });
            }).catch((e) => {
                console.error(e);
            });

        return res;
    }
    /**
     * 插入
     * @param tablename 数据表名称
     * @param columns 列名，如["id","name"]
     * @param params_columns 参数列名，如[":id",":name"]
     * @param params 参数数据，如{"id":"1","name":"测试"}
     */
    async insert(tablename: string, columns: string[], params_columns: string[], params: {}): Promise<any> {
        let sql = `insert into ${tablename} (${columns.join(',')}) values ( ${params_columns.join(',')} )`,
            res = await new Promise((resolve, reject) => {
                this.connection.query(sql, params, function (error: any, results: any, fields: any) {
                    if (error) {
                        reject(error);
                    };
                    return resolve(results);
                });
            }).catch((e) => {
                console.error(e);
            });

        return res;
    }

    /**
     * 修改
     * @param tablename 数据表名称
     * @param columns 列名，如FirstName = :FirstName
     * @param condition 参数，如LastName = :LastName 
     * @param params 参数，如{FirstName:"x",LastName:'l'}
     */
    async update(tablename: string, columns: string, condition: string, params: {}): Promise<any> {
        let sql = `update ${tablename} set ${columns} where ${condition}`,
            res = await new Promise((resolve, reject) => {
                this.connection.query(sql, params, function (error: any, results: any, fields: any) {
                    if (error) {
                        reject(error);
                    };
                    return resolve(results);
                });
            }).catch((e) => {
                console.error(e);
            });

        return res;
    }

    /**
    * 删除
    * @param tablename 数据表名称
    * @param condition 参数，如LastName = :LastName 
    * @param params 参数，如{FirstName:"x",LastName:'l'}
    */
    async delete(tablename: string, condition: string, params?: {}): Promise<any> {
        let sql = `delete from ${tablename} where ${condition.trim() ? condition : "1=1"}`,
            res = await new Promise((resolve, reject) => {
                this.connection.query(sql, params, function (error: any, results: any, fields: any) {
                    if (error) {
                        reject(error);
                    };
                    return resolve(results);
                });
            }).catch((e) => {
                console.error(e);
            });

        return res;
    }

    /**
     * 执行SQL
     * @param sql SQL语句
     * @param params 参数
     */
    async execute(sql: string, params?: {}): Promise<any> {

        let res = await new Promise((resolve, reject) => {
            this.connection.query(sql, params, function (error: any, results: any, fields: any) {
                if (error) {
                    reject(error);
                };
                return resolve(results);
            });
        }).catch((e) => {
            console.error(e);
        });

        return res;

    }

}

export { DbHelper };
