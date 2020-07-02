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
const lib_1 = require("../lib");
const Express = require('express'), bodyParser = require('body-parser'), app = new Express(), xmlparser = require('express-xml-bodyparser');
app.use(bodyParser.json({ limit: "500000kb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(xmlparser());
let weixin = new lib_1.default.Model.WeixinConfig();
weixin.AppID = 'wx6e8dfa0d32f32337';
weixin.AppSecret = '17615bea97ed1952ac2e14ebe289626f';
weixin.Key = 'CCNHDBURTHGFEQWEDNJHYGDYEWZP9527';
weixin.MchID = '1499013532';
weixin.Redirect_uri = 'http://127.0.0.1:8888/auth';
weixin.NotifyUrl = "http://xulayen.imwork.net:13561/notice";
weixin.SSlCertPath = `E:\\6certs\\test.txt`;
weixin.SSlCertPassword = "123";
weixin.Ip = "10.20.26.19";
weixin.Facid = "00000";
new lib_1.default.Config.WeixinPayConfig(weixin);
new lib_1.default.Config.RedisConfig("10.20.31.11", "6379", 10);
new lib_1.default.Config.MySqlConfig("192.168.101.30", "root", "abc123.", "cPay");
app.get('/auth', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let ojsapipay = new lib_1.default.JsApiPay(req, res, next);
        yield ojsapipay.GetWeixinUserInfo('http://baidu.com', false);
        console.log(ojsapipay.WeixinUserInfo);
    });
});
app.post('/notice', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('推送-通知：notice');
        console.log(req);
        let notify = new lib_1.default.Notify.CommonlyNotify(req, res, next);
        yield notify.ProcessNotify();
    });
});
app.post('/notice/native', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('推送-扫码支付模式1-通知：');
        console.log(req);
        let notify = new lib_1.default.Notify.NativeNotify(req, res, next);
        yield notify.ProcessNotify();
    });
});
app.post('/h5pay', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let h5pay = new lib_1.default.H5Pay(), scene = new lib_1.default.Model.SceneInfo("11", "22", "444"), orderinfo = new lib_1.default.Model.OrderInfo();
        orderinfo.body = "1111111";
        orderinfo.total_fee = 100;
        h5pay.orderInfo = orderinfo;
        //out_trade_no
        let res_order = yield h5pay.UnifiedOrder(new Date().getTime().toString(), scene, "http://baidu.com/");
        console.log(res_order);
        res.send(res_order);
    });
});
app.post('/jspay', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let ojsapipay = new lib_1.default.JsApiPay(req, res, next), openid = req.body.openid;
        ojsapipay.orderInfo = new lib_1.default.Model.OrderInfo("test", "test", "test", "test", 100);
        let res_order = yield ojsapipay.UnifiedOrder(openid);
        console.log(res_order);
        let paramter = ojsapipay.GetJsApiPayParameters();
        res.send(paramter);
    });
});
app.post('/native/prepay', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let nativepay = new lib_1.default.NativePay();
        nativepay.orderInfo = new lib_1.default.Model.OrderInfo();
        nativepay.orderInfo.body = "商品描述";
        nativepay.orderInfo.total_fee = 1;
        nativepay.orderInfo.attach = "附件信息";
        nativepay.orderInfo.detail = "详细信息";
        nativepay.orderInfo.goods_tag = "测试";
        let url = yield nativepay.GetPrePayUrl("111111");
        res.send(url);
    });
});
app.post('/native/pay', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let nativepay = new lib_1.default.NativePay(), oinfo = new lib_1.default.Model.OrderInfo();
        oinfo.body = "商品描述";
        oinfo.total_fee = 1;
        oinfo.attach = "附件信息";
        oinfo.detail = "详细信息";
        oinfo.goods_tag = "测试";
        nativepay.orderInfo = oinfo;
        let url = yield nativepay.GetPayUrl("1111111111");
        res.send(url);
    });
});
app.post('/wxapay', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let wxaPay = new lib_1.default.WxaPay();
        wxaPay.orderInfo = new lib_1.default.Model.OrderInfo();
        wxaPay.orderInfo.body = "99999999";
        wxaPay.orderInfo.total_fee = 100;
        wxaPay.orderInfo.attach = "vvvv";
        wxaPay.orderInfo.detail = "bb";
        wxaPay.orderInfo.goods_tag = "aa";
        let data = yield wxaPay.UnifiedOrder(new Date().getTime().toString(), "oi4qm1cAO4em3nUtBgOsOORvJhOk");
        let p = wxaPay.GetWxaApiPayParameters();
        console.log(p);
        res.send(data);
    });
});
app.post('/apppay', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let appPay = new lib_1.default.AppPay();
        appPay.orderInfo = new lib_1.default.Model.OrderInfo();
        appPay.orderInfo.body = "99999999";
        appPay.orderInfo.total_fee = 100;
        appPay.orderInfo.attach = "vvvv";
        appPay.orderInfo.detail = "bb";
        appPay.orderInfo.goods_tag = "aa";
        let data = yield appPay.UnifiedOrder("1111111111", { device_info: "111" }), p = appPay.GetAppApiPayParameters();
        console.log(p);
        res.send(data);
    });
});
app.post('/micropay', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let microPay = new lib_1.default.MicroPay(), auth_code = req.body.auth_code;
        microPay.orderInfo = new lib_1.default.Model.OrderInfo();
        microPay.orderInfo.body = "99999999";
        microPay.orderInfo.total_fee = 1;
        microPay.orderInfo.attach = "56565656565";
        microPay.orderInfo.detail = "bb";
        microPay.orderInfo.goods_tag = "aa";
        let data = yield microPay.Scan(new Date().getTime().toString(), auth_code);
        console.log(data);
        res.send(data);
    });
});
app.post('/orderquery', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let paydata = new lib_1.default.Model.WxPayData(), orderinfo, ordernumber = req.body.ordernumber;
        paydata.SetValue("out_trade_no", ordernumber);
        try {
            orderinfo = yield lib_1.default.BaseApi.OrderQuery(paydata);
        }
        catch (error) {
            orderinfo = error.message;
        }
        res.send(orderinfo);
    });
});
app.post('/closeorder', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let paydata = new lib_1.default.Model.WxPayData(), orderinfo;
        paydata.SetValue("out_trade_no", "111");
        try {
            orderinfo = yield lib_1.default.BaseApi.CloseOrder(paydata);
        }
        catch (error) {
            orderinfo = error.message;
        }
        res.send(orderinfo);
    });
});
app.post('/Refund', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let paydata = new lib_1.default.Model.WxPayData(), orderinfo;
        paydata.SetValue("out_refund_no", "111");
        paydata.SetValue("out_trade_no", "11111111111");
        paydata.SetValue("refund_fee", "11111111111");
        paydata.SetValue("op_user_id", "11111111111");
        paydata.SetValue("total_fee", "11111111111");
        try {
            orderinfo = yield lib_1.default.BaseApi.Refund(paydata);
        }
        catch (error) {
            orderinfo = error.message;
        }
        res.send(orderinfo);
    });
});
app.post('/RefundQuery', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let paydata = new lib_1.default.Model.WxPayData(), orderinfo;
        paydata.SetValue("out_refund_no", "111");
        try {
            orderinfo = yield lib_1.default.BaseApi.RefundQuery(paydata);
        }
        catch (error) {
            orderinfo = error.message;
        }
        res.send(orderinfo);
    });
});
app.post('/ShortUrl', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let paydata = new lib_1.default.Model.WxPayData(), orderinfo;
        paydata.SetValue("long_url", "111");
        try {
            orderinfo = yield lib_1.default.BaseApi.ShortUrl(paydata);
        }
        catch (error) {
            orderinfo = error.message;
        }
        res.send(orderinfo);
    });
});
app.listen(8888, function (err) {
    if (err) {
        console.error('err:', err);
    }
    else {
        var _content = `===> api server is running at at http://10.20.26.19:8888`;
        console.info(_content);
    }
});
