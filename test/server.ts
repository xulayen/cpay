import cPay from '../lib';
const Express = require('express'),
    bodyParser = require('body-parser'),
    app = new Express(),
    xmlparser = require('express-xml-bodyparser');

app.use(bodyParser.json({ limit: "500000kb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(xmlparser());


let weixin = new cPay.Model.WeixinConfig();
weixin.AppID = 'wx6e8dfa0d32f32337';
weixin.AppSecret = '17615bea97ed1952ac2e14ebe289626f';
weixin.Key = 'CCNHDBURTHGFEQWEDNJHYGDYEWZP9527';
weixin.MchID = '1499013532';
weixin.Redirect_uri = 'http://127.0.0.1:8888/auth';
weixin.NotifyUrl = "NotifyUrl";
weixin.SSlCertPath = `E:\\6certs\\test.txt`;
weixin.SSlCertPassword = "123";
weixin.Ip = "10.20.26.19";

new cPay.Config.WeixinPayConfig(weixin);
new cPay.Config.RedisConfig("10.20.31.11", "6379", 10);



app.get('/auth', async function (req: any, res: any, next: any) {
    let ojsapipay = new cPay.JsApiPay(req, res, next);
    await ojsapipay.GetWeixinUserInfo('http://baidu.com', false);
    console.log(ojsapipay.WeixinUserInfo);
});


app.post('/notice', async function (req: any, res: any, next: any) {

    let notify = new cPay.Notify.NativeNotify(req, res, next);
    await notify.ProcessNotify();

});



app.post('/h5pay', async function (req: any, res: any, next: any) {

    let h5pay = new cPay.H5Pay(),
        scene = new cPay.Model.SceneInfo("11", "22", "444"),
        orderinfo = new cPay.Model.OrderInfo();
    orderinfo.body = "1111111";
    orderinfo.total_fee = 100;
    h5pay.orderInfo = orderinfo;
    //out_trade_no

    let res_order = await h5pay.UnifiedOrder("1111111", scene);
    console.log(res_order);

    res.send(res_order);
});

app.post('/jspay', async function (req: any, res: any, next: any) {

    let ojsapipay = new cPay.JsApiPay(req, res, next);
    ojsapipay.orderInfo = new cPay.Model.OrderInfo("test", "test", "test", "test", 100);
    let res_order = await ojsapipay.UnifiedOrder("oQ7mswreaeOwzIKtXhaIX1Urcjbo");
    console.log(res_order);
    let paramter = ojsapipay.GetJsApiPayParameters();
    res.send(paramter);


});


app.post('/native/prepay', async function (req: any, res: any, next: any) {
    let nativepay = new cPay.NativePay();
    let url = await nativepay.GetPrePayUrl("1111111111");
    res.send(url);
});

app.post('/native/pay', async function (req: any, res: any, next: any) {
    let nativepay = new cPay.NativePay(), oinfo = new cPay.Model.OrderInfo();
    oinfo.body = "99999999";
    oinfo.total_fee = 100;
    oinfo.attach = "vvvv";
    oinfo.detail = "bb";
    oinfo.goods_tag = "aa";
    nativepay.orderInfo = oinfo;
    let url = await nativepay.GetPayUrl("1111111111");
    res.send(url);
});

app.post('/wxapay', async function (req: any, res: any, next: any) {
    let wxaPay = new cPay.WxaPay();
    wxaPay.orderInfo = new cPay.Model.OrderInfo();
    wxaPay.orderInfo.body = "99999999";
    wxaPay.orderInfo.total_fee = 100;
    wxaPay.orderInfo.attach = "vvvv";
    wxaPay.orderInfo.detail = "bb";
    wxaPay.orderInfo.goods_tag = "aa";
    let data = await wxaPay.UnifiedOrder("1111111111", "22222222222222222222222222222222");

    let p = wxaPay.GetWxaApiPayParameters();
    console.log(p);
    res.send(data);
});


app.post('/apppay', async function (req: any, res: any, next: any) {
    let appPay = new cPay.AppPay();
    appPay.orderInfo = new cPay.Model.OrderInfo();
    appPay.orderInfo.body = "99999999";
    appPay.orderInfo.total_fee = 100;
    appPay.orderInfo.attach = "vvvv";
    appPay.orderInfo.detail = "bb";
    appPay.orderInfo.goods_tag = "aa";
    let data = await appPay.UnifiedOrder("1111111111", { device_info: "111" }),
        p = appPay.GetAppApiPayParameters();
    console.log(p);
    res.send(data);
});

app.post('/micropay', async function (req: any, res: any, next: any) {
    let microPay = new cPay.MicroPay();
    microPay.orderInfo = new cPay.Model.OrderInfo();
    microPay.orderInfo.body = "99999999";
    microPay.orderInfo.total_fee = 100;
    microPay.orderInfo.attach = "vvvv";
    microPay.orderInfo.detail = "bb";
    microPay.orderInfo.goods_tag = "aa";
    let data = await microPay.Scan("1111111111","1111111111111111111111111111111111111111");
    console.log(data);
    res.send(data);
});




app.post('/orderquery', async function (req: any, res: any, next: any) {

    let paydata = new cPay.Model.WxPayData(), orderinfo;
    paydata.SetValue("transaction_id", "111");

    try {
        orderinfo = await cPay.BaseApi.OrderQuery(paydata);

    } catch (error) {
        orderinfo = error.message;
    }

    res.send(orderinfo);

});


app.post('/closeorder', async function (req: any, res: any, next: any) {

    let paydata = new cPay.Model.WxPayData(), orderinfo;
    paydata.SetValue("out_trade_no", "111");

    try {
        orderinfo = await cPay.BaseApi.CloseOrder(paydata);

    } catch (error) {
        orderinfo = error.message;
    }

    res.send(orderinfo);

});


app.post('/Refund', async function (req: any, res: any, next: any) {

    let paydata = new cPay.Model.WxPayData(), orderinfo;
    paydata.SetValue("out_refund_no", "111");
    paydata.SetValue("out_trade_no", "11111111111");
    paydata.SetValue("refund_fee", "11111111111");
    paydata.SetValue("op_user_id", "11111111111");
    paydata.SetValue("total_fee", "11111111111");

    try {
        orderinfo = await cPay.BaseApi.Refund(paydata);

    } catch (error) {
        orderinfo = error.message;
    }

    res.send(orderinfo);

});


app.post('/RefundQuery', async function (req: any, res: any, next: any) {

    let paydata = new cPay.Model.WxPayData(), orderinfo;
    paydata.SetValue("out_refund_no", "111");

    try {
        orderinfo = await cPay.BaseApi.RefundQuery(paydata);

    } catch (error) {
        orderinfo = error.message;
    }

    res.send(orderinfo);

});



app.post('/ShortUrl', async function (req: any, res: any, next: any) {

    let paydata = new cPay.Model.WxPayData(), orderinfo;
    paydata.SetValue("long_url", "111");

    try {
        orderinfo = await cPay.BaseApi.ShortUrl(paydata);

    } catch (error) {
        orderinfo = error.message;
    }

    res.send(orderinfo);

});

app.listen(8888, function (err: any) {
    if (err) {
        console.error('err:', err);
    } else {
        var _content = `===> api server is running at at http://10.20.26.19:8888`;
        console.info(_content);
    }
});