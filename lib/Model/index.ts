import { Util, RedisClient } from '../Util';
export class OrderInfo {
    constructor(body?: string, detail?: string, attach?: string, goods_tag?: string, total_fee?: number) {
        this.body = body;
        this.detail = detail;
        this.attach = attach;
        this.goods_tag = goods_tag;
        this.total_fee = total_fee;
    }

    body: string;
    detail: string;
    attach: string;
    goods_tag: string;
    total_fee: number;
}

export class RedisConfig {
    constructor(host: string, port: string, db: number, auth?: string) {
        Util.redisClient = new RedisClient(host, port, db, auth)
    }
}

export class WeixinConfig {

    constructor() {

    }
    AppID: string;
    MchID: string;
    Key: string;
    AppSecret: string;
    SSlCertPath: string;
    SSlCertPassword: string;
    NotifyUrl: string;
    Ip: string;
    ProxyUrl: string;
    ReportLevel: string;
    LogLevel: string;
    Redirect_uri: string;
}