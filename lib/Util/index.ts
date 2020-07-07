import * as  cPay_Config from '../Config';
const rp = require('request-promise');
const fs = require('fs'),
    path = require('path'),
    redis = require("redis"),
    crypto = require("crypto");



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

    private async select(key: any): Promise<any> {
        let doc = await new Promise((resolve, reject) => {
            this.client.get(key, (err: any, res: any) => {
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

    public async get(key: any): Promise<any> {
        let doc = await this.select(key);
        return doc ? JSON.parse(doc) : null;
    };

    public set(key: any, value: any, time = 6000): void {
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

    private static async ErrorInterceptors(err: any) {
        return err;
    }

    public static async setMethodWithUri(option: any) {
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
            transform: function (body: any, res: any, resolveWithFullResponse: any) {
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
        map.forEach(function (value: any, key: any) {
            if (!value) {
                throw new Error(`WxPayData内部含有值为null的字段:${key}!`);
            }
            if (value != "") {
                buff += key + "=" + value + "&";
            }

        });

        buff = buff.trim().substr(0, buff.length - 1);;
        return buff;
    }


    public static IsString(input: any) {

        return Object.prototype.toString.call(input) === '[object String]'

    }

    public static IsObject(input: any) {

        return Object.prototype.toString.call(input) === '[object Object]'

    }

    public static sleep(milliSeconds: number) {
        var StartTime = new Date().getTime();
        let i = 0;
        while (new Date().getTime() < StartTime + milliSeconds);
    }

    /**
     * 微信推送消息解密
     * https://whyour.cn/post/qywx-nodejs.html
     * @static
     * @param {string} data
     * @returns
     * @memberof Util
     */
    public static _decode(data: string) {
        let aesKey = Buffer.from(cPay_Config.Config.GetWxPayConfig().GetOpenAesKey() + '=', 'base64');
        let aesCipher = crypto.createDecipheriv("aes-256-cbc", aesKey, aesKey.slice(0, 16));
        aesCipher.setAutoPadding(false);
        let decipheredBuff = Buffer.concat([aesCipher.update(data, 'base64'), aesCipher.final()]);
        decipheredBuff = this.PKCS7Decoder(decipheredBuff);
        let len_netOrder_corpid = decipheredBuff.slice(16);
        let msg_len = len_netOrder_corpid.slice(0, 4).readUInt32BE(0);
        const result = len_netOrder_corpid.slice(4, msg_len + 4).toString();
        return result; // 返回一个解密后的明文
    }
    private static PKCS7Decoder(buff: any) {
        var pad = buff[buff.length - 1];
        if (pad < 1 || pad > 32) {
            pad = 0;
        }
        return buff.slice(0, buff.length - pad);
    }

    public static format(str: string, ...rest: string[]) {
        if (rest.length == 0)
            return str;

        for (var i = 0; i < rest.length; i++) {
            var re = new RegExp('\\{' + (i) + '\\}', 'gm');
            str = str.replace(re, rest[i]);
        }
        return str;
    }







}