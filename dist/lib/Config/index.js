"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = exports.MySqlConfig = exports.RedisConfig = exports.WeixinPayConfig = void 0;
class WeixinPayConfig {
    constructor(CustomerWeixinConfig) {
        this.CustomerWeixinConfig = CustomerWeixinConfig;
        Config.wxconfig = this;
    }
    GetFacID() {
        return this.CustomerWeixinConfig && this.CustomerWeixinConfig.Facid || "";
    }
    GetRedirect_uri() {
        return this.CustomerWeixinConfig && this.CustomerWeixinConfig.Redirect_uri || "";
    }
    GetAppID() {
        return this.CustomerWeixinConfig && this.CustomerWeixinConfig.AppID || "";
    }
    GetMchID() {
        return this.CustomerWeixinConfig && this.CustomerWeixinConfig.MchID || "";
    }
    GetKey() {
        return this.CustomerWeixinConfig && this.CustomerWeixinConfig.Key || "";
    }
    GetAppSecret() {
        return this.CustomerWeixinConfig && this.CustomerWeixinConfig.AppSecret || "";
    }
    GetSSlCertPath() {
        return this.CustomerWeixinConfig && this.CustomerWeixinConfig.SSlCertPath || "";
    }
    GetSSlCertPassword() {
        return this.CustomerWeixinConfig && this.CustomerWeixinConfig.SSlCertPassword || "";
    }
    GetNotifyUrl() {
        return this.CustomerWeixinConfig && this.CustomerWeixinConfig.NotifyUrl || "";
    }
    GetIp() {
        return this.CustomerWeixinConfig && this.CustomerWeixinConfig.Ip || "";
    }
    GetProxyUrl() {
        return this.CustomerWeixinConfig && this.CustomerWeixinConfig.ProxyUrl || "";
    }
    GetReportLevel() {
        return this.CustomerWeixinConfig && this.CustomerWeixinConfig.ReportLevel || "";
    }
    GetLogLevel() {
        return this.CustomerWeixinConfig && this.CustomerWeixinConfig.LogLevel || "";
    }
}
exports.WeixinPayConfig = WeixinPayConfig;
class RedisConfig {
    constructor(host, port, db, auth) {
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
}
exports.RedisConfig = RedisConfig;
class MySqlConfig {
    constructor(host, user, password, database) {
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
}
exports.MySqlConfig = MySqlConfig;
class Config {
    constructor() {
    }
    static set wxconfig(value) {
        this._wxconfig = value;
    }
    static get redisconfig() {
        return Config._redisconfig;
    }
    static set redisconfig(value) {
        Config._redisconfig = value;
    }
    static get mysqlconfig() {
        return Config._mysqlconfig;
    }
    static set mysqlconfig(value) {
        Config._mysqlconfig = value;
    }
    static GetWxPayConfig(CustomerWeixinConfig) {
        if (!this._wxconfig) {
            this._wxconfig = new WeixinPayConfig(CustomerWeixinConfig);
        }
        return this._wxconfig;
    }
    static GetRedisConfig(host, port, db, auth) {
        if (!this._redisconfig) {
            this._redisconfig = new RedisConfig(host, port, db, auth);
        }
        return this._redisconfig;
    }
    static GetMySqlConfig(host, user, password, database) {
        if (!this._mysqlconfig) {
            this._mysqlconfig = new MySqlConfig(host, user, password, database);
        }
        return this._mysqlconfig;
    }
}
exports.Config = Config;
//}
