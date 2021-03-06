[![Build Status](https://travis-ci.org/xulayen/cpay.svg?branch=master)](https://travis-ci.org/xulayen/cpay)
[![GitHub license](https://img.shields.io/github/license/xulayen/cpay)](https://github.com/xulayen/cpay/blob/master/LICENSE)
[![codecov](https://codecov.io/gh/xulayen/cpay/branch/master/graph/badge.svg)](https://codecov.io/gh/xulayen/cpay)
[![NPM Version](https://badgen.net/npm/v/jquery_wechat_sdk)](https://npmjs.org/package/cpay)

# 微信/支付宝支付 For Typescript Express
> 使用Typescript语法开发基于Express框架的支付组件

| 功能        | 微信（基于公众/商户号）    |  微信（基于开放平台）    | 支付宝  |
| --------   | -----:   | :----: | :----: |
| [微信付款码支付](#付款码支付) [支付宝付款码支付](#支付宝付款码支付)        | ✔      |   微信开放平台不支持    |   ✔    |
| [微信扫码支付1](#扫码支付模式1)  [微信扫码支付2](#扫码支付模式2)         | ✔      |   微信开放平台不支持    |   ✖    |
| [微信H5支付](#h5支付)  [支付宝H5支付](#支付宝H5支付)       | ✔    |   微信开放平台不支持    |   ✔    |
| [微信JSAPI支付](#jsapi支付)        | ✔      |   微信开放平台不支持    |   ✖    |
| [微信小程序支付](#小程序支付)        | ✔      |   微信开放平台不支持    |   ✖    |
| [微信APP支付](#app支付)        | ✔      |   微信开放平台不支持    |   ✖    |
| 刷脸支付        | ✖      |   微信开放平台不支持    |   ✖    |
| [微信支付结果通知](#微信支付结果通知)        | ✔      |   微信开放平台不支持    |   ✖    |
| [微信查询订单](#查询订单)       | ✔      |   微信开放平台不支持    |   ✖    |
| [微信撤销订单](#撤销订单)        | ✔      |   微信开放平台不支持    |   ✖    |
| [微信申请退款](#申请退款)        | ✔      |   微信开放平台不支持    |   ✖    |
| [微信查询退款](#查询退款)        | ✔      |   微信开放平台不支持    |   ✖    |
| [微信短链接生成](#短链接生成)        | ✔      |   微信开放平台不支持    |   ✖    |
| [微信网页授权](#公众号发起网页授权)        | ✔      |   ✔    |   ✖    |
| [微信JSSDK](#开放平台代替公众号使用jssdk)         |   ✖   |   ✔    |   ✖    |
| [微信红包](#微信现金红包)  [查询微信红包](#查询微信现金红包)       |   ✔   |   微信开放平台不支持    |   ✖    |
| [微信零钱转账](#微信零钱转账)   [查询微信零钱转账](#查询微信零钱转账)       |   ✔   |   微信开放平台不支持    |   ✖    |


## 安装

``` js
$ npm i cpay 
```
## 使用

``` js
import cPay from 'cpay';
```

## Express简单架构

``` js
const Express = require('express'),
    bodyParser = require('body-parser'),
    app = new Express(),
    xmlparser = require('express-xml-bodyparser');

app.use(bodyParser.json({ limit: "500000kb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(xmlparser());
```

## 配置
### 微信支付参数设置

``` js
// 微信支付配置对象
let weixin = new cPay.Model.WeixinConfig();
weixin.AppID = '微信公众号APPID';
weixin.AppSecret = '微信公众号AppSecret';
weixin.Key = '商户KEY';
weixin.MchID = '商户号';
weixin.Redirect_uri = '微信授权获取微信信息回调地址';
weixin.NotifyUrl = "微信支付回调通知结果地址";
weixin.SSlCertPath = `证书路径`;
weixin.SSlCertPassword = "证书密码";
weixin.Ip = "服务器IP";
weixin.Facid = "商户业务编号";
weixin.OpenAppid = "开放平台APPID";
weixin.OpenAppsecret = "开放平台密钥";
weixin.OpenAesKey = "开放平台消息加解密KEY";
// 启用配置对象，实例化即可启用
new cPay.Config.WeixinPayConfig(weixin);
```

### 支付宝支付参数设置

``` js
// 支付宝支付配置对象
let alipay = new cPay.Model.AlipayConfig();
alipay.AppID = "支付宝应用ID";
alipay.PrivateKey = "支付宝私钥";
alipay.AesKey = "支付宝AES密钥";
alipay.Notify_url = "支付宝通知地址";
new cPay.Config.AlipayPayConfig(alipay);
```

### Redis配置

``` js
// 启用配置对象，实例化即可启用
new cPay.Config.RedisConfig("Redis地址", "端口", "库编号");
```

### MySql配置

[建库建表脚本](./test/doc/db.sql)

``` js
// 启用配置对象，实例化即可启用
new cPay.Config.MySqlConfig("数据库实例地址", "登录帐号","密码", "cPay");

```


## API

### 支付宝支付

#### 支付宝付款码支付

``` js
let microPay = new cPay.AliPay.MicroPay();
//条码支付，取值：bar_code
//声波支付，取值：wave_code
let data = await microPay.UnifiedOrder("订单号", "bar_code", "付款码", "备注");
```

#### 支付宝H5支付

``` js
let h5pay = new cPay.AliPay.WapPay();
let data = await h5pay.UnifiedOrder("订单号", "应用回调地址", "订单总金额，单位：元", "标题", "销售产品码，商家和支付宝签约的产品码");
```


### 微信支付

#### 付款码支付

``` js
// 使用付款码支付API实例
let microPay = new cPay.MicroPay();
// 创建商品信息
microPay.orderInfo = new cPay.Model.OrderInfo();
microPay.orderInfo.body = "商品描述";
microPay.orderInfo.total_fee = "总金额，数字类型，单位分";
microPay.orderInfo.attach = "附加数据";
microPay.orderInfo.detail = "商品详情";
microPay.orderInfo.goods_tag = "商品标记";
let data = await microPay.Scan("商户订单号", "用户付款码","其他可选参数，JSON对象");
```

#### 扫码支付，模式1

``` js
// 使用扫码支付API
let nativepay = new cPay.NativePay();
nativepay.orderInfo = new cPay.Model.OrderInfo();
nativepay.orderInfo.body = "商品描述";
nativepay.orderInfo.total_fee = "总金额，数字类型，单位分";
nativepay.orderInfo.attach = "附加数据";
nativepay.orderInfo.detail = "商品详情";
nativepay.orderInfo.goods_tag = "商品标记";
// 扫码模式1 API
let url = await nativepay.GetPrePayUrl("商品ID");
```

#### 扫码支付，模式2

``` js
// 使用扫码支付API
let nativepay = new cPay.NativePay();
nativepay.orderInfo = new cPay.Model.OrderInfo();
nativepay.orderInfo.body = "商品描述";
nativepay.orderInfo.total_fee = "总金额，数字类型，单位分";
nativepay.orderInfo.attach = "附加数据";
nativepay.orderInfo.detail = "商品详情";
nativepay.orderInfo.goods_tag = "商品标记";
// 扫码模式2 API
let url = await nativepay.GetPayUrl("商品ID","其他可选参数，JSON对象");
```

#### H5支付

``` js
// 使用H5支付API
let h5pay = new cPay.H5Pay(),
scene = new cPay.Model.SceneInfo("场景类型", "WAP网站URL地址", "WAP 网站名");
h5pay.orderInfo = new cPay.Model.OrderInfo();
h5pay.orderInfo.body = "商品描述";
h5pay.orderInfo.total_fee = "总金额，数字类型，单位分";
h5pay.orderInfo.attach = "附加数据";
h5pay.orderInfo.detail = "商品详情";
h5pay.orderInfo.goods_tag = "商品标记";
// H5支付统一下单API
let res_order = await h5pay.UnifiedOrder("商户订单号", scene, "应用回调地址","其他可选参数，JSON对象");
```

#### JSAPI支付

``` js
// 服务端
app.post('/jspay', async function (req: any, res: any, next: any) {
    // 使用JSAPI 支付
    let ojsapipay = new cPay.JsApiPay(req, res, next);
    ojsapipay.orderInfo = new cPay.Model.OrderInfo("商品描述", "商品描述", "附加数据", "商品标记", "总金额，数字类型，单位分");
    // JSAPI统一下单API
    let res_order = await ojsapipay.UnifiedOrder("微信用户openid","其他可选参数，JSON对象");
    // 获取前端支付参数
    let paramter = ojsapipay.GetJsApiPayParameters();
    res.send(paramter);

});


// 客户端
function onBridgeReady(){
   WeixinJSBridge.invoke(
      'getBrandWCPayRequest', paramter,
      function(res){
      if(res.err_msg == "get_brand_wcpay_request:ok" ){
        //使用以上方式判断前端返回,微信团队郑重提示：
        //res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
      } 
   }); 
}
if (typeof WeixinJSBridge == "undefined"){
   if( document.addEventListener ){
       document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
   }else if (document.attachEvent){
       document.attachEvent('WeixinJSBridgeReady', onBridgeReady); 
       document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
   }
}else{
   onBridgeReady();
}

```

#### 小程序支付

``` js
// 服务端
app.post('/wxapay', async function (req: any, res: any, next: any) {
    // 使用小程序支付API
    let wxaPay = new cPay.WxaPay();
    wxaPay.orderInfo = new cPay.Model.OrderInfo();
    wxaPay.orderInfo.body = "商品描述";
    wxaPay.orderInfo.total_fee = "总金额，数字类型，单位分";
    wxaPay.orderInfo.attach = "附加数据";
    wxaPay.orderInfo.detail = "商品详情";
    wxaPay.orderInfo.goods_tag = "商品标记";
    let data = await wxaPay.UnifiedOrder("商户订单号", "微信用户openid","其他可选参数，JSON对象");
    let parameters = wxaPay.GetWxaApiPayParameters();
    res.send(parameters);
});

// 客户端
wx.requestPayment(
{
    ...parameters,
    'success':function(res){},
    'fail':function(res){},
    'complete':function(res){}
})

```

#### APP支付

``` js

// 服务端
app.post('/wxapay', async function (req: any, res: any, next: any) {
    // 使用APP支付API
    let appPay = new cPay.AppPay();
    appPay.orderInfo = new cPay.Model.OrderInfo();
    appPay.orderInfo.body = "商品描述";
    appPay.orderInfo.total_fee = "总金额，数字类型，单位分";
    appPay.orderInfo.attach = "附加数据";
    appPay.orderInfo.detail = "商品详情";
    appPay.orderInfo.goods_tag = "商品标记";
    let data = await appPay.UnifiedOrder("商户订单号","其他可选参数，JSON对象"),
        parameters = appPay.GetAppApiPayParameters();
    res.send(parameters);
});

```

#### 微信现金红包

``` js

app.get('/sendredpack', async function (req: any, res: any, next: any) {
    let redpack = new cPay.SendRedpack(), 
        redinfo = new cPay.Model.RedPackInfo();
    redinfo.act_name = "活动名称";
    redinfo.openid = "微信OPENID";
    redinfo.remark = "备注";
    redinfo.send_name = "商户名称";
    redinfo.total_amount = "金额，单位：分";
    redinfo.scene_id = "场景类型，举例：cPay.Model.RedPackSceneEnum.Draw";
    redinfo.wishing = "祝福语，如：感谢您参加猜灯谜活动，祝您元宵节快乐！";
    let data = await redpack.Send(redinfo);
});

```

#### 查询微信现金红包

``` js

app.get('/selectwxhb', async function (req: any, res: any, next: any) {
    let orderinfo= await cPay.BaseWxApi.GetRedPackInfo("商户订单号");
    res.send(orderinfo);
});

```

#### 微信零钱转账

``` js

app.get('/transfer', async function (req: any, res: any, next: any) {
    let redpack = new cPay.SendRedpack();
    let data = await redpack.Transfer("微信用户OPENID","金额，单位：分","描述");
});

```

#### 查询微信零钱转账

``` js

app.get('/selecttransfer', async function (req: any, res: any, next: any) {
    let orderinfo= await cPay.BaseWxApi.GetTransferInfo("商户订单号");
    res.send(orderinfo);
});

```

### 微信支付结果通知

#### 通用支付结果推送地址

``` js

app.post('/notice', async function (req: any, res: any, next: any) {
    let notify = new cPay.Notify.CommonlyNotify(req, res, next);
    await notify.ProcessNotify();
});

```

#### 扫码支付模式1支付结果推送地址

``` js

app.post('/notice/native', async function (req: any, res: any, next: any) {
    let notify = new cPay.Notify.NativeNotify(req, res, next);
    await notify.ProcessNotify();
});

```

### 微信支付基础API

#### 查询订单

``` js

let paydata = new cPay.Model.WxPayData(), orderinfo;
paydata.SetValue("out_trade_no", "商户订单号");
orderinfo = await cPay.BaseWxApi.OrderQuery(paydata);

```

#### 撤销订单

``` js

let paydata = new cPay.Model.WxPayData(), orderinfo;
paydata.SetValue("out_trade_no", "商户订单号");
orderinfo = await cPay.BaseWxApi.CloseOrder(paydata);

```

#### 申请退款

``` js

let paydata = new cPay.Model.WxPayData(), orderinfo;
paydata.SetValue("out_refund_no", "商户退款单号");
paydata.SetValue("out_trade_no", "商户订单号");
paydata.SetValue("refund_fee", "退款金额：订单总金额，单位为分，只能为整数");
paydata.SetValue("op_user_id", "操作员");
paydata.SetValue("total_fee", "订单金额：订单总金额，单位为分，只能为整数");
orderinfo = await cPay.BaseWxApi.Refund(paydata);

```

#### 查询退款

``` js

let paydata = new cPay.Model.WxPayData(), orderinfo;
paydata.SetValue("out_refund_no", "商户退款单号");
orderinfo = await cPay.BaseWxApi.RefundQuery(paydata);

```

#### 短链接生成

``` js

let paydata = new cPay.Model.WxPayData(), orderinfo;
paydata.SetValue("long_url", "需要转换的URL，传输需URL encode");
orderinfo = await cPay.BaseWxApi.ShortUrl(paydata);

```

#### 公众号发起网页授权

``` js

app.get('/auth', async function (req: any, res: any, next: any) {
    let ojsapipay = new cPay.JsApiPay(req, res, next);
    await ojsapipay.GetWeixinUserInfo('网页应用回调地址', "是否是静默授权，Boolean类型");
    // 打印微信用户信息
    console.log(ojsapipay.WeixinUserInfo);
});


```


## 微信开放平台

### 开放平台代替公众号发起网页授权

- 方式一：回调地址如果为当前路由地址

``` js

weixin.Redirect_uri="http://开放平台设置的域名/open/getwxinfo";
app.get('/open/getwxinfo', async function (req: any, res: any, next: any) {
    let ojsapipay = new cPay.AccountWebsiteAuth(req, res, next);
    let wxinfo = await ojsapipay.GetWeixinUserInfo("wx97e377b7691b236a");
    console.log(wxinfo);
    console.log(ojsapipay.WeixinUserInfo);
});


```

- 方式二：回调地址和发起请求地址不一样

``` js

weixin.Redirect_uri="http://开放平台设置的域名/wechat/authorize-code";
app.get('/open/getwxinfo', async function (req: any, res: any, next: any) {
    let ojsapipay = new cPay.AccountWebsiteAuth(req, res, next);
    let wxinfo = await ojsapipay.GetWeixinUserInfo("wx97e377b7691b236a");
});

app.get('/wechat/authorize-code', async function (req: any, res: any, next: any) {
   let ojsapipay = new cPay.AccountWebsiteAuth(req, res, next);
    let wxinfo = await ojsapipay.GetWeixinUserInfoFromCode("wx97e377b7691b236a");
    console.log(wxinfo);
    console.log(ojsapipay.WeixinUserInfo);
});


```

### 开放平台代替公众号使用JSSDK

> 在申请第三方平台时填写的网页开发域名，将作为旗下授权公众号的 JS SDK 安全域名（详情见“接入前必读”-“申请资料说明”）
> 最多可设置三个，用“;”隔开

``` js
// 服务端
app.get('/jssdk', async function (req: any, res: any, next: any) {
    let jssdk = new cPay.JssdkSign();
    let data = await jssdk.GetJSSDK('公众号APPID','当前需要使用JSSDK的页面地址');
    // 输出参数到模版jssdk
    res.render('jssdk', { data: data });
});

```

*关于JSSDK基于Jquery常用方法封装组件，请到*[*NPM包微信JSSDK*](https://www.npmjs.com/package/jquery_wechat_sdk)*查看。注意！此组件不在维护，如有需要自行下载修改源码！*

``` js
// 客户端
<script src="http://res2.wx.qq.com/open/js/jweixin-1.6.0.js"></script>

<script>
    wx.config({
        debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: '<%= data.appid%>', // 必填，公众号的唯一标识
        timestamp: '<%= data.timestamp %>', // 必填，生成签名的时间戳
        nonceStr: '<%= data.noncestr%>', // 必填，生成签名的随机串
        signature: '<%= data.signature%>',// 必填，签名
        jsApiList: ["scanQRCode"] // 必填，需要使用的JS接口列表
    });

    wx.ready(function () {
        // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
        console.log('OK');
    });
    wx.error(function (res) {
        // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
        console.log('error');
    });

    function Scan() {
        wx.scanQRCode({
            needResult: 0, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
            scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
            success: function (res) {
                var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
                console.log(result);
            }
        });
    }
</script>

<button onclick="Scan()" style="width: 150px; height: 40px; background-color: beige;">
    扫一扫
</button>

```

## 作者
- [徐大腿](http://xulayen.com/)

## 打赏
<!-- ![avatar](./test/doc/wxqrcode.jpg)  -->
<img src="./test/doc/wxqrcode.jpg" width="350px"/>
<img src="./test/doc/alipayqrcode.jpg" width="350px"/>



