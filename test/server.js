const cPay_JsApiPay = require('../lib/WechatPay/JsApiPay').cPay_JsApiPay;
const Express = require('express');
const app = new Express();
const JsApiPay = cPay_JsApiPay.JsApiPay;
// 获取验证码路由
app.get('/auth', async function (req, res, next) {
    //var codeData = valid.getCode(req, res);
    let api = new JsApiPay(req, res, next);
    await api.GetOpenidAndAccessToken('http://baidu.com',false);
    console.log(api.access_token);
    console.log(api.openid);


});

app.listen(8888, function (err) {
    if (err) {
        console.error('err:', err);
    } else {
        var _content = `===> api server is running at at http://10.20.26.19:8888`;
        console.info(_content);
    }
});