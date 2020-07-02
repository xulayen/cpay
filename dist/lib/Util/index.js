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
exports.Util = exports.RedisClient = void 0;
const cPay_Config = require("../Config");
const rp = require('request-promise');
const fs = require('fs'), path = require('path'), redis = require("redis");
class RedisClient {
    constructor(host, port, db, auth) {
        this.client = redis.createClient({
            host: host,
            port: port,
            db: db,
            auth: auth
        });
    }
    select(key) {
        return __awaiter(this, void 0, void 0, function* () {
            let doc = yield new Promise((resolve, reject) => {
                this.client.get(key, (err, res) => {
                    if (err) {
                        reject(err);
                    }
                    return resolve(res);
                });
            }).catch((e) => {
                console.error(e);
            });
            return doc;
        });
    }
    ;
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            let doc = yield this.select(key);
            return doc ? JSON.parse(doc) : null;
        });
    }
    ;
    set(key, value, time = 6000) {
        value = JSON.stringify(value);
        this.client.set(key, value);
        if (time)
            this.client.expire(key, time);
    }
    ;
}
exports.RedisClient = RedisClient;
class Util {
    constructor() {
    }
    static get redisClient() {
        let redisconfig = cPay_Config.Config.GetRedisConfig();
        if (!Util._redisClient) {
            Util._redisClient = new RedisClient(redisconfig.Host, redisconfig.Port, redisconfig.DB, redisconfig.Auth);
        }
        return Util._redisClient;
    }
    static set redisClient(value) {
        this._redisClient = value;
    }
    static ErrorInterceptors(err) {
        return __awaiter(this, void 0, void 0, function* () {
            return err;
        });
    }
    static setMethodWithUri(option) {
        return __awaiter(this, void 0, void 0, function* () {
            let certFile, cert;
            if (option.cert) {
                certFile = path.resolve(option.cert);
                cert = {
                    cert: fs.readFileSync(certFile),
                    passphrase: option.password
                };
            }
            ;
            var __option = Object.assign(Object.assign({ url: option.url, method: option.method, json: option.json || false, headers: Object.assign({}, option.headers) }, cert), { body: option.data });
            const reqPromiseOpt = Object.assign({}, __option, {
                transform: function (body, res, resolveWithFullResponse) {
                    return body;
                }
            });
            try {
                return rp(reqPromiseOpt).catch(this.ErrorInterceptors);
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    static ToUrlParams(map) {
        let buff = "";
        map.forEach(function (value, key) {
            if (!value) {
                throw new Error(`WxPayData内部含有值为null的字段:${key}!`);
            }
            if (value != "") {
                buff += key + "=" + value + "&";
            }
        });
        buff = buff.trim().substr(0, buff.length - 1);
        ;
        return buff;
    }
    static IsString(input) {
        return Object.prototype.toString.call(input) === '[object String]';
    }
    static IsObject(input) {
        return Object.prototype.toString.call(input) === '[object Object]';
    }
    static sleep(milliSeconds) {
        var StartTime = new Date().getTime();
        let i = 0;
        while (new Date().getTime() < StartTime + milliSeconds)
            ;
    }
}
exports.Util = Util;
