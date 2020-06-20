"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeixinConfig = exports.RedisConfig = exports.OrderInfo = void 0;
const Util_1 = require("../Util");
class OrderInfo {
    constructor(body, detail, attach, goods_tag, total_fee) {
        this.body = body;
        this.detail = detail;
        this.attach = attach;
        this.goods_tag = goods_tag;
        this.total_fee = total_fee;
    }
}
exports.OrderInfo = OrderInfo;
class RedisConfig {
    constructor(host, port, db, auth) {
        Util_1.Util.redisClient = new Util_1.RedisClient(host, port, db, auth);
    }
}
exports.RedisConfig = RedisConfig;
class WeixinConfig {
    constructor() {
    }
}
exports.WeixinConfig = WeixinConfig;
