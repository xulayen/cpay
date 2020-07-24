import cPay from '../index';
import Config from './config';
import { Util } from 'lib/Util';
const Express = require('express'),
    bodyParser = require('body-parser'),
    app = new Express(),
    xmlparser = require('express-xml-bodyparser'),
    path = require('path'),
    ejs = require('ejs'),
    crypto = require("crypto");

app.use(bodyParser.json({ limit: "500000kb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(xmlparser());


let weixin = new cPay.Model.WeixinConfig();
weixin.AppID = Config.weixin.AppID;
weixin.AppSecret = Config.weixin.AppSecret;
weixin.Key = Config.weixin.Key;
weixin.MchID = Config.weixin.MchID;
weixin.Redirect_uri = Config.weixin.Redirect_uri;
weixin.NotifyUrl = Config.weixin.NotifyUrl;
weixin.SSlCertPath = Config.weixin.SSlCertPath;
weixin.SSlCertPassword = Config.weixin.SSlCertPassword;
weixin.Ip = Config.weixin.Ip;
weixin.Facid = Config.weixin.Facid;
weixin.OpenAppid = Config.weixin.openAppid;
weixin.OpenAppsecret = Config.weixin.openAppsecrect;
weixin.OpenAesKey = Config.weixin.openAesKey;

let alipay = new cPay.Model.AlipayConfig();
alipay.AppID = Config.Alipay.AppID;
alipay.PrivateKey = Config.Alipay.PrivateKey;
alipay.AesKey = Config.Alipay.AesKey;
alipay.Notify_url = Config.Alipay.Notify_url;

new cPay.Config.WeixinPayConfig(weixin);
new cPay.Config.RedisConfig(Config.redis.host, Config.redis.port, Config.redis.db);
new cPay.Config.MySqlConfig(Config.mySql.host, Config.mySql.user, Config.mySql.pwd, Config.mySql.db);

new cPay.Config.AlipayPayConfig(alipay);

app.get('/auth', async function (req: any, res: any, next: any) {
    let ojsapipay = new cPay.JsApiPay(req, res, next);
    await ojsapipay.GetWeixinUserInfo('http://xulayen.imwork.net:13561/', false);
    console.log(ojsapipay.WeixinUserInfo);
});

app.get('/open/getwxinfo', async function (req: any, res: any, next: any) {
    let ojsapipay = new cPay.AccountWebsiteAuth(req, res, next);
    let wxinfo = await ojsapipay.GetWeixinUserInfo("wx97e377b7691b236a");
    console.log(wxinfo);
    console.log(ojsapipay.WeixinUserInfo);
});

app.get('/wechat/authorize-code', async function (req: any, res: any, next: any) {
    let ojsapipay = new cPay.AccountWebsiteAuth(req, res, next);
    let wxinfo = await ojsapipay.GetWeixinUserInfoFromCode("wx97e377b7691b236a");
    console.log(wxinfo);
    console.log(ojsapipay.WeixinUserInfo);
});



app.post('/notice', async function (req: any, res: any, next: any) {
    console.log('推送-通知：notice');
    console.log(req);
    let notify = new cPay.Notify.CommonlyNotify(req, res, next);
    await notify.ProcessNotify();
});


app.post('/notice/native', async function (req: any, res: any, next: any) {
    console.log('推送-扫码支付模式1-通知：');
    console.log(req);

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

    let res_order = await h5pay.UnifiedOrder(new Date().getTime().toString(), scene, "http://baidu.com/");
    console.log(res_order);

    res.send(res_order);
});

app.post('/jspay', async function (req: any, res: any, next: any) {

    let ojsapipay = new cPay.JsApiPay(req, res, next), openid = req.body.openid;
    ojsapipay.orderInfo = new cPay.Model.OrderInfo("test", "test", "test", "test", 100);
    let res_order = await ojsapipay.UnifiedOrder(openid);
    console.log(res_order);
    let paramter = ojsapipay.GetJsApiPayParameters();
    res.send(paramter);


});


app.post('/native/prepay', async function (req: any, res: any, next: any) {
    let nativepay = new cPay.NativePay();
    nativepay.orderInfo = new cPay.Model.OrderInfo();
    nativepay.orderInfo.body = "商品描述";
    nativepay.orderInfo.total_fee = 1;
    nativepay.orderInfo.attach = "附件信息";
    nativepay.orderInfo.detail = "详细信息";
    nativepay.orderInfo.goods_tag = "测试";
    let url = await nativepay.GetPrePayUrl("111111");
    res.send(url);
});

app.post('/native/pay', async function (req: any, res: any, next: any) {
    let nativepay = new cPay.NativePay(), oinfo = new cPay.Model.OrderInfo();
    oinfo.body = "商品描述";
    oinfo.total_fee = 1;
    oinfo.attach = "附件信息";
    oinfo.detail = "详细信息";
    oinfo.goods_tag = "测试";
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
    let data = await wxaPay.UnifiedOrder(new Date().getTime().toString(), "oi4qm1cAO4em3nUtBgOsOORvJhOk");

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
    let microPay = new cPay.MicroPay(), auth_code = req.body.auth_code;
    microPay.orderInfo = new cPay.Model.OrderInfo();
    microPay.orderInfo.body = "99999999";
    microPay.orderInfo.total_fee = 1;
    microPay.orderInfo.attach = "56565656565";
    microPay.orderInfo.detail = "bb";
    microPay.orderInfo.goods_tag = "aa";
    let data = await microPay.Scan(new Date().getTime().toString(), auth_code);
    console.log(data);
    res.send(data);
});




app.post('/orderquery', async function (req: any, res: any, next: any) {

    let paydata = new cPay.Model.WxPayData(), orderinfo,
        ordernumber = req.body.ordernumber;
    paydata.SetValue("out_trade_no", ordernumber);

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


app.set('views', path.join(__dirname, ".", 'web'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');
app.use(Express.static(path.join(__dirname, 'web/public')));

app.get('/index', function (req: any, res: any) {
    res.render('index', { title: 'users member' });
});

app.post('/weixinopen/accept', function (req: any, res: any) {

    console.log('接受微信推送的验证票据：');
    console.log(req.body);
    res.send('success');
    return;
});



//http://xulayen.imwork.net:13561/h5pay
app.get('/h5pay', async function (req: any, res: any) {

    let h5pay = new cPay.H5Pay(),
        scene = new cPay.Model.SceneInfo("11", "22", "444"),
        orderinfo = new cPay.Model.OrderInfo();
    orderinfo.body = "1111111";
    orderinfo.total_fee = 1;
    h5pay.orderInfo = orderinfo;
    let res_order = await h5pay.UnifiedOrder(new Date().getTime().toString(), scene, "http://xulayen.imwork.net:13561/success");
    console.log(res_order);

    let url = res_order.data.GetValue("mweb_url");
    //res.render('h5pay', res_order);
    res.redirect(url);
});

app.get('/success', function (req: any, res: any) {
    res.render('success', { title: '成功' });
});

//http://xulayen.imwork.net:13561/jspay?openid=oi4qm1cAO4em3nUtBgOsOORvJhOk
app.get('/jspay', async function (req: any, res: any, next: any) {
    let ojsapipay = new cPay.JsApiPay(req, res, next), openid = req.query.openid;
    ojsapipay.orderInfo = new cPay.Model.OrderInfo("test", "test", "test", "test", 1);
    let res_order = await ojsapipay.UnifiedOrder(openid);
    console.log(res_order);
    let paramter = ojsapipay.GetJsApiPayParameters();
    res.render('jspay', { data: paramter });
});


app.post('/accept/ticket', async function (req: any, res: any, next: any) {

    /*****
     * 
     * {"appid":["wx9a1a29d63b33cd3d"],"encrypt":["PzQzcHNK5/21taYCHrAaWsRo9F3UMIm5MtJdgXeijFopsdGWqVQ2UddGkvhpqApt4wv309JIA1Dkg4ZxPxQEQLoR8FOVgix6JT01H8E5jj0MERPz5jwoVSHDSTGJTsaJz1P0StsVwpRVTItUWq6FYYPTdd+txKyylhIQ9lcyyAMm1Pm79M4/FJ2zfzhziaqqKm5KRX8vrOFWMs35CxhxeO6ELi5wQgTbo4w44+/bYYCxmqcv0Jqr43UlWKXb6s4P5nD5GViCADVC/kEQjb/JOv2focGLYvWIOpNG7SRPYe4k5W/JNKuIStnUWoBQZXhDZocovTSO9OyuWv1u11hgIQjf0UCLKTL1pSM7dqFESk2ByEync+VtcjMr0lAp73HyObmzKtnYhPaDeWHnMKU6NZRByWi8mdqRcWGKPozFOFPGx5QEm1Kx/OMWMnW9rd9yUQEJX8VPOXAymxp5a9o0QQ=="]}
     * 
     */

    let accept = new cPay.Notify.WxOpenPlatformAccept(req, res, next);
    accept.ProcessNotify();
    console.log('商户接收票据：');
    console.log(await accept.Ticket());

});

app.post('/ticket', async function (req: any, res: any, next: any) {

    console.log('开放平台推送票据：');
    console.log(JSON.stringify(req.body.xml));
    cPay.Util.setMethodWithUri({
        url: `http://xulayen.imwork.net:13561/accept/ticket`,
        method: 'post',
        json: true,
        data: req.body
    });

    res.send(`success`);

});

//http://wxauth.xulayen.com:8888/openauth
app.get('/openauth', async function (req: any, res: any, next: any) {
    let openauth = new cPay.ComponentLogin(req, res, next);
    let url = await openauth.AuthLogin('http://wxauth.xulayen.com:8888/openauth/callback');
    res.render('openauth', { data: url });
});

app.get('/openauth/callback', function (req: any, res: any, next: any) {
    let openauth = new cPay.ComponentLogin(req, res, next);
    openauth.AuthLoginCallBack();
    res.render('success');
});

//http://public.xulayen.com:8888/jssdk
app.get('/jssdk', async function (req: any, res: any, next: any) {
    let jssdk = new cPay.JssdkSign();
    let data = await jssdk.GetJSSDK('wx97e377b7691b236a', 'http://public.xulayen.com/jssdk');
    res.render('jssdk', { data: data });
});


//http://public.xulayen.com:8888/sendredpack
app.get('/sendredpack', async function (req: any, res: any, next: any) {
    let redpack = new cPay.SendRedpack(), redinfo = new cPay.Model.RedPackInfo();
    redinfo.act_name = "测试活动";
    redinfo.openid = "oi4qm1cAO4em3nUtBgOsOORvJhOk";
    redinfo.remark = "测试";
    redinfo.send_name = "中商网络";
    redinfo.total_amount = 100;
    redinfo.scene_id = cPay.Model.RedPackSceneEnum.Draw;
    redinfo.wishing = "感谢您参加猜灯谜活动，祝您元宵节快乐！";
    let data = await redpack.Send(redinfo);
    console.log(data);
    res.send(data);
    // res.render('redpack', { data: data });
});

//http://public.xulayen.com:8888/transfer
app.get('/transfer', async function (req: any, res: any, next: any) {
    let redpack = new cPay.SendRedpack();
    let data = await redpack.Transfer("oi4qm1cAO4em3nUtBgOsOORvJhOk", 100, "测试");
    console.log(data);
    res.send(data);
    // res.render('redpack', { data: data });
});

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------
//--AliPay--------------------------------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------
//http://public.xulayen.com/aliPay/MicroPay
app.get('/aliPay/MicroPay', async function (req: any, res: any, next: any) {
    let redpack = new cPay.AliPay.MicroPay();
    let data = await redpack.UnifiedOrder(new Date().getTime() + '', "wave_code", "282828282222222222222222", "测试");
    res.render('ali_MicroPay', { data: data });
});

app.get('/aliPay/h5', async function (req: any, res: any, next: any) {
    res.render('ali_wappay', {});
});


//http://public.xulayen.com/aliPay/wappay
app.get('/aliPay/wappay', async function (req: any, res: any, next: any) {
    let redpack = new cPay.AliPay.WapPay();
    let data = await redpack.UnifiedOrder(new Date().getTime() + '', "http://baidu.com/", 100, "测试", "12121212121");
});


app.listen(80, function (err: any) {
    if (err) {
        console.error('err:', err);
    } else {
        var _content = `===> api server is running at at http://127.0.0.1:80`;
        console.info(_content);
    }
});




//开放平台获取code
//https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx97e377b7691b236a&redirect_uri=http://wxauth.xulayen.com:8888/auth&response_type=code&scope=snsapi_base&state=STATE&component_appid=wx9a1a29d63b33cd3d#wechat_redirect

//https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxc46c96addcb23ab9&redirect_uri=http://wxauth.xulayen.com:8888/auth&response_type=code&scope=snsapi_userinfo&state=STATE&component_appid=wx9a1a29d63b33cd3d#wechat_redirect