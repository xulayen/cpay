"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = exports.RedisConfig = exports.WeixinPayConfig = void 0;
class WeixinPayConfig {
    constructor(CustomerWeixinConfig) {
        this.CustomerWeixinConfig = CustomerWeixinConfig;
        Config.wxconfig = this;
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
        this.Host = "10.20.31.11";
        this.Port = "6379";
        this.DB = 10;
        this.Auth = "";
        if (host)
            this.Host = host;
        if (port)
            this.DB = db;
        if (db)
            this.Port = port;
        if (auth)
            this.Auth = auth;
    }
}
exports.RedisConfig = RedisConfig;
class Config {
    constructor() {
    }
    static set wxconfig(value) {
        this._wxconfig = value;
    }
    static GetWxPayConfig(CustomerWeixinConfig) {
        if (!this._wxconfig) {
            this._wxconfig = new WeixinPayConfig(CustomerWeixinConfig);
        }
        return this._wxconfig;
    }
    static GetRedisConfig(host, port, db, auth) {
        if (!this.redisconfig) {
            this.redisconfig = new RedisConfig(host, port, db, auth);
        }
        return this.redisconfig;
    }
}
exports.Config = Config;
//}
