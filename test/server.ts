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
        orderinfo = await cPay.BaseWxApi.OrderQuery(paydata);

    } catch (error) {
        orderinfo = error.message;
    }

    res.send(orderinfo);

});


app.post('/closeorder', async function (req: any, res: any, next: any) {

    let paydata = new cPay.Model.WxPayData(), orderinfo;
    paydata.SetValue("out_trade_no", "111");

    try {
        orderinfo = await cPay.BaseWxApi.CloseOrder(paydata);

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
        orderinfo = await cPay.BaseWxApi.Refund(paydata);

    } catch (error) {
        orderinfo = error.message;
    }

    res.send(orderinfo);

});


app.post('/RefundQuery', async function (req: any, res: any, next: any) {

    let paydata = new cPay.Model.WxPayData(), orderinfo;
    paydata.SetValue("out_refund_no", "111");

    try {
        orderinfo = await cPay.BaseWxApi.RefundQuery(paydata);

    } catch (error) {
        orderinfo = error.message;
    }

    res.send(orderinfo);

});



app.post('/ShortUrl', async function (req: any, res: any, next: any) {

    let paydata = new cPay.Model.WxPayData(), orderinfo;
    paydata.SetValue("long_url", "111");

    try {
        orderinfo = await cPay.BaseWxApi.ShortUrl(paydata);

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
    redinfo.act_name = "营销活动";
    //http://127.0.0.1:3333/transfer?openid=oi4qm1ds6LBBD7_A47Ko7lS7KziU
    //oi4qm1YENTE4MS99-KVkNqWpR12g huaduoduoxx http://127.0.0.1:3333/transfer?openid=oi4qm1YENTE4MS99-KVkNqWpR12g
    //oi4qm1cAO4em3nUtBgOsOORvJhOk ME
    //oi4qm1ecq6mhu8Jglfk0cTrMfSu0 LP
    //oi4qm1Qw_ZT_UKisrRIH5IQZB1ec JJ
    //oi4qm1VPTJYiDW3IANj7hRFbtsi4 MM http://127.0.0.1:3333/transfer?openid=oi4qm1Z56XlFReA9Y7T4S07P1rU8
    //oi4qm1eCxMdOhvGpRYXaG3A6Ww1s love1xiaoxi 01 http://127.0.0.1:3333/transfer?openid=oi4qm1eCxMdOhvGpRYXaG3A6Ww1s ×
    //oi4qm1QZDFoVHcQOOQGpB-7F5FtQ heroyou2020 02 http://127.0.0.1:3333/transfer?openid=oi4qm1QZDFoVHcQOOQGpB-7F5FtQ ×
    //oi4qm1bfaUjdpBnFGSr-3E2y1goQ hervip2020 03 http://127.0.0.1:3333/transfer?openid=oi4qm1bfaUjdpBnFGSr-3E2y1goQ ×
    //oi4qm1ds6LBBD7_A47Ko7lS7KziU talkme1997 04 http://127.0.0.1:3333/transfer?openid=oi4qm1ds6LBBD7_A47Ko7lS7KziU ×
    //oi4qm1bk7yt7jnhBR-3Z0jelFupQ sakurayou2021 05 http://127.0.0.1:3333/transfer?openid=oi4qm1bk7yt7jnhBR-3Z0jelFupQ ×
    //oi4qm1QGX7wrCVKPtQZNv7dW-tJU smmokq 06 http://127.0.0.1:3333/transfer?openid=oi4qm1QGX7wrCVKPtQZNv7dW-tJU ×
    //oi4qm1Uay1geJ99Skz3wdsnaO2gQ w205fyb 07 http://127.0.0.1:3333/transfer?openid=oi4qm1Uay1geJ99Skz3wdsnaO2gQ
    redinfo.openid = "oi4qm1cAO4em3nUtBgOsOORvJhOk";
    redinfo.remark = "恭喜发财！";
    redinfo.send_name = "中商网络";
    redinfo.total_amount = 100 * 10;
    redinfo.scene_id = cPay.Model.RedPackSceneEnum.Draw;
    redinfo.wishing = "恭喜发财！";
    let data = await redpack.Send(redinfo);
    console.log(data);
    res.send(data);
    // res.render('redpack', { data: data });
});

//http://public.xulayen.com:8888/selectwxhb
app.get('/selectwxhb', async function (req: any, res: any, next: any) {

    let orderinfo;

    try {
        orderinfo = await cPay.BaseWxApi.GetRedPackInfo("20200910162833727");

    } catch (error) {
        orderinfo = error.message;
    }

    res.send(orderinfo);

});


// m_values: Map {
//     'return_code' => 'SUCCESS',
//     'return_msg' => '',
//     'mch_appid' => 'wx6e8dfa0d32f32337',
//     'mchid' => '1499013532',
//     'nonce_str' => '1631512323410',
//     'result_code' => 'SUCCESS',
//     'partner_trade_no' => '20210913135202867',
//     'payment_no' => '10100960621962109130705052116751',
//     'payment_time' => '2021-09-13 13:52:03'
//   }
//http://public.xulayen.com:8888/selecttransfer
app.get('/selecttransfer', async function (req: any, res: any, next: any) {

    let orderinfo;

    try {
        orderinfo = await cPay.BaseWxApi.GetTransferInfo("20210913135202867");

    } catch (error) {
        orderinfo = error.message;
    }

    res.send(orderinfo);

});

//http://public.xulayen.com:8888/transfer
app.get('/transfer', async function (req: any, res: any, next: any) {
    let redpack = new cPay.SendRedpack(), openid = req.query.openid;
    let data = await redpack.Transfer(openid, 88, "恭喜发财！");
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

function onGetTimeFrameToTime(starTime:any, endTime:any) {
    let m = new Date(starTime);
    let mt = m.getTime();
    let n = new Date(endTime);
    let nt = n.getTime();
    let s = nt - mt;
    let sm = Math.floor(Math.random() * s);
    return new Date(mt + sm);
}


app.listen(7777, function (err: any) {
    if (err) {
        console.error('err:', err);
    } else {
        var _content = `===> api server is running at at http://127.0.0.1:7777`;
        console.info(_content);
    }
});




//开放平台获取code
//https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx97e377b7691b236a&redirect_uri=http://wxauth.xulayen.com:8888/auth&response_type=code&scope=snsapi_base&state=STATE&component_appid=wx9a1a29d63b33cd3d#wechat_redirect

//https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxc46c96addcb23ab9&redirect_uri=http://wxauth.xulayen.com:8888/auth&response_type=code&scope=snsapi_userinfo&state=STATE&component_appid=wx9a1a29d63b33cd3d#wechat_redirect