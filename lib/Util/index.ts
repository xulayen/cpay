import * as  cPay_Config from '../Config';
const rp = require('request-promise');
const fs = require('fs'),
    path = require('path'),
    redis = require("redis");


export class RedisClient {

    private client: any;
    constructor(host: string, port: string, db: number, auth?: string) {
        this.client = redis.createClient({
            host: host,
            port: port,
            db: db,
            auth: auth
        });
    }

    private async select(key): Promise<any> {
        let doc = await new Promise((resolve, reject) => {
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
    };

    public async get(key): Promise<any> {
        let doc = await this.select(key);
        return doc ? JSON.parse(doc) : null;
    };

    public set(key, value, time = 6000): void {
        value = JSON.stringify(value);
        this.client.set(key, value);
        if (time)
            this.client.expire(key, time)
    };

}

export class Util {

    private static _redisClient: RedisClient;
    public static get redisClient(): RedisClient {
        let redisconfig = cPay_Config.Config.GetRedisConfig();
        if (!Util._redisClient) {
            Util._redisClient = new RedisClient(redisconfig.Host, redisconfig.Port, redisconfig.DB, redisconfig.Auth);
        }
        return Util._redisClient;
    }
    public static set redisClient(value: RedisClient) {
        this._redisClient = value;
    }


    constructor() {

    }

    private static async ErrorInterceptors(err) {
        return err;
    }

    public static async setMethodWithUri(option) {
        let certFile, cert;
        if (option.cert) {
            certFile = path.resolve(option.cert);
            cert = {
                cert: fs.readFileSync(certFile),
                passphrase: option.password
            };
        };
        var __option = {
            url: option.url,
            method: option.method,
            json: option.json || false,
            headers: {
                ...option.headers
            },
            ...cert,
            body: option.data
        };
        const reqPromiseOpt = Object.assign({}, __option, {
            transform: function (body, res, resolveWithFullResponse) {
                return body;
            }
        });

        try {

            return rp(reqPromiseOpt).catch(this.ErrorInterceptors);
        } catch (e) {
            console.error(e);

        }
    }

    public static ToUrlParams(map: any) {
        let buff = "";
        map.forEach(function (value, key) {
            if (!value) {
                throw new Error("WxPayData内部含有值为null的字段!");
            }
            if (value != "") {
                buff += key + "=" + value + "&";
            }

        });

        buff = buff.trim();
        return buff;
    }





}