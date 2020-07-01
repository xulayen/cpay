
import * as Model from '../Model';
import { Util } from 'lib/Util';


//export namespace cPay_Config {
export interface IWxConfig {

    CustomerWeixinConfig: Model.WeixinConfig;

    GetFacID(): string;

    //=======【基本信息设置】=====================================
    /* 微信公众号信息配置
    * APPID：绑定支付的APPID（必须配置）
    * MCHID：商户号（必须配置）
    * KEY：商户支付密钥，参考开户邮件设置（必须配置），请妥善保管，避免密钥泄露
    * APPSECRET：公众帐号secert（仅JSAPI支付的时候需要配置），请妥善保管，避免密钥泄露
    */
    GetAppID(): string;
    GetMchID(): string;
    GetKey(): string;
    GetAppSecret(): string;

    //=======【证书路径设置】===================================== 
    /* 证书路径,注意应该填写绝对路径（仅退款、撤销订单时需要）
     * 1.证书文件不能放在web服务器虚拟目录，应放在有访问权限控制的目录中，防止被他人下载；
     * 2.建议将证书文件名改为复杂且不容易猜测的文件
     * 3.商户服务器要做好病毒和木马防护工作，不被非法侵入者窃取证书文件。
    */
    GetSSlCertPath(): string;
    GetSSlCertPassword(): string;



    //=======【支付结果通知url】===================================== 
    /* 支付结果通知回调url，用于商户接收支付结果
    */
    GetNotifyUrl(): string;

    //=======【商户系统后台机器IP】===================================== 
    /* 此参数可手动配置也可在程序中自动获取
    */
    GetIp(): string;


    //=======【代理服务器设置】===================================
    /* 默认IP和端口号分别为0.0.0.0和0，此时不开启代理（如有需要才设置）
    */
    GetProxyUrl(): string;


    //=======【上报信息配置】===================================
    /* 测速上报等级，0.关闭上报; 1.仅错误时上报; 2.全量上报
    */
    GetReportLevel(): string;


    //=======【日志级别】===================================
    /* 日志等级，0.不输出日志；1.只输出错误信息; 2.输出错误和正常信息; 3.输出错误信息、正常信息和调试信息
    */
    GetLogLevel(): string;


    //=======【公众号回调地址】===================================
    GetRedirect_uri(): string;

}

export interface IRedisConfig {
    Host: string;
    Port: string;
    DB: number;
    Auth: string;
}

export interface IMySqlConfig {
    host: string,
    user: string,
    password: string,
    database: string
}

export class WeixinPayConfig implements IWxConfig {


    constructor(CustomerWeixinConfig?: Model.WeixinConfig) {
        this.CustomerWeixinConfig = CustomerWeixinConfig;
        Config.wxconfig = this;
    }
    CustomerWeixinConfig: Model.WeixinConfig;

    GetFacID(): string {
        return this.CustomerWeixinConfig && this.CustomerWeixinConfig.Facid || "";
    }

    GetRedirect_uri(): string {
        return this.CustomerWeixinConfig && this.CustomerWeixinConfig.Redirect_uri || "";
    }
    GetAppID(): string {
        return this.CustomerWeixinConfig && this.CustomerWeixinConfig.AppID || "";
    }
    GetMchID(): string {
        return this.CustomerWeixinConfig && this.CustomerWeixinConfig.MchID || "";
    }
    GetKey(): string {
        return this.CustomerWeixinConfig && this.CustomerWeixinConfig.Key || "";
    }
    GetAppSecret(): string {
        return this.CustomerWeixinConfig && this.CustomerWeixinConfig.AppSecret || "";
    }
    GetSSlCertPath(): string {
        return this.CustomerWeixinConfig && this.CustomerWeixinConfig.SSlCertPath || "";
    }
    GetSSlCertPassword(): string {
        return this.CustomerWeixinConfig && this.CustomerWeixinConfig.SSlCertPassword || "";
    }
    GetNotifyUrl(): string {
        return this.CustomerWeixinConfig && this.CustomerWeixinConfig.NotifyUrl || "";
    }
    GetIp(): string {
        return this.CustomerWeixinConfig && this.CustomerWeixinConfig.Ip || "";
    }
    GetProxyUrl(): string {
        return this.CustomerWeixinConfig && this.CustomerWeixinConfig.ProxyUrl || "";
    }
    GetReportLevel(): string {
        return this.CustomerWeixinConfig && this.CustomerWeixinConfig.ReportLevel || "";
    }
    GetLogLevel(): string {
        return this.CustomerWeixinConfig && this.CustomerWeixinConfig.LogLevel || "";
    }

}

export class RedisConfig implements IRedisConfig {
    constructor(host: string, port: string, db: number, auth?: string) {
        if (host)
            this.Host = host;
        if (port)
            this.DB = db;
        if (db)
            this.Port = port;
        if (auth)
            this.Auth = auth;
        Config.redisconfig = this;
    }
    Host: string;
    Port: string ;
    DB: number;
    Auth: string;
}

export class MySqlConfig implements IMySqlConfig {

    constructor(host: string, user: string, password: string, database: string) {
        if (host)
            this.host = host;
        if (user)
            this.user = user;
        if (password)
            this.password = password;
        if (database)
            this.database = database;
        Config.mysqlconfig = this;
    }

    host: string ;
    user: string;
    password: string ;
    database: string ;

}

export class Config {
    private static _wxconfig: IWxConfig;
    public static set wxconfig(value: IWxConfig) {
        this._wxconfig = value;
    }

    private static _redisconfig: IRedisConfig;
    public static get redisconfig(): IRedisConfig {
        return Config._redisconfig;
    }
    public static set redisconfig(value: IRedisConfig) {
        Config._redisconfig = value;
    }

    private static _mysqlconfig: IMySqlConfig;
    public static get mysqlconfig(): IMySqlConfig {
        return Config._mysqlconfig;
    }
    public static set mysqlconfig(value: IMySqlConfig) {
        Config._mysqlconfig = value;
    }


    constructor() {

    }

    public static GetWxPayConfig(CustomerWeixinConfig?: Model.WeixinConfig): IWxConfig {
        if (!this._wxconfig) {
            this._wxconfig = new WeixinPayConfig(CustomerWeixinConfig);
        }
        return this._wxconfig;
    }

    public static GetRedisConfig(host?: string, port?: string, db?: number, auth?: string): IRedisConfig {
        if (!this._redisconfig) {
            this._redisconfig = new RedisConfig(host, port, db, auth);
        }
        return this._redisconfig;
    }

    public static GetMySqlConfig(host?: string, user?: string, password?: string, database?: string): IMySqlConfig {
        if (!this._mysqlconfig) {
            this._mysqlconfig = new MySqlConfig(host, user, password, database);
        }
        return this._mysqlconfig;
    }



}
//}