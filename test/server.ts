import cPay from '../lib/cPay';
const Express = require('express'),
    app = new Express();

let weixin = new cPay.Model.WeixinConfig();
weixin.AppID = 'wxc46c96addcb23ab9';
weixin.AppSecret = 'd4624c36b6795d1d99dcf0547af5443d';
weixin.Key = 'CYRYFWCXtoken130826';
weixin.MchID = '1305176001';
weixin.Redirect_uri = 'http://10.20.26.19:8888/auth';
weixin.NotifyUrl = "NotifyUrl";
weixin.SSlCertPath = `E:\\工作\\workpace\\txz\\txz2020\\src\\assets\\images\\oao\\bg1.png`;
weixin.SSlCertPassword = "123";
weixin.Ip = "10.20.26.19";

new cPay.Config.WeixinPayConfig(weixin);
new cPay.Config.RedisConfig("10.20.31.11", "6379", 10);




app.get('/auth', async function (req, res, next) {
    let ojsapipay = new cPay.JsApiPay(req, res, next);
    await ojsapipay.GetWeixinUserInfo('http://baidu.com', false);
    console.log(ojsapipay.WeixinUserInfo);



    if (ojsapipay.WeixinUserInfo) {
        let order = new cPay.Model.OrderInfo("test", "test", "test", "test", 100);
        let res_order = await ojsapipay.UnifiedOrder(order, ojsapipay.WeixinUserInfo.openid);
        console.log(res_order);
    }
});

app.listen(8888, function (err) {
    if (err) {
        console.error('err:', err);
    } else {
        var _content = `===> api server is running at at http://10.20.26.19:8888`;
        console.info(_content);
    }
});