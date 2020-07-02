# 微信/支付宝支付 For Typescript Express

| 功能        | 微信    |  支付宝  |
| --------   | -----:   | :----: |
| 付款码支付        | ✔      |   ✖    |
| 扫码支付        | ✔      |   ✖    |
| H5支付        | ✔    |   ✖    |
| JSAPI支付        | ✔      |   ✖    |
| 小程序支付        | ✔      |   ✖    |
| APP支付        | ✔      |   ✖    |
| 刷脸支付        | ✖      |   ✖    |
| 支付结果通知        | ✔      |   ✖    |
| 查询订单       | ✔      |   ✖    |
| 撤销订单        | ✔      |   ✖    |
| 申请退款        | ✔      |   ✖    |
| 查询退款        | ✔      |   ✖    |
| 短链接生成        | ✔      |   ✖    |

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
// 启用配置对象，实例化即可启用
new cPay.Config.WeixinPayConfig(weixin);
```

### Redis配置

``` js
// 启用配置对象，实例化即可启用
new cPay.Config.RedisConfig("Redis地址", "端口", "库编号");
```

### MySql配置

[建库建表脚本](./lib/dal/db.sql)

``` js
// 启用配置对象，实例化即可启用
new cPay.Config.MySqlConfig("数据库实例地址", "登录帐号","密码", "cPay");

```


## API

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
orderinfo = await cPay.BaseApi.OrderQuery(paydata);

```

#### 撤销订单

``` js

let paydata = new cPay.Model.WxPayData(), orderinfo;
paydata.SetValue("out_trade_no", "商户订单号");
orderinfo = await cPay.BaseApi.CloseOrder(paydata);

```

#### 申请退款

``` js

let paydata = new cPay.Model.WxPayData(), orderinfo;
paydata.SetValue("out_refund_no", "商户退款单号");
paydata.SetValue("out_trade_no", "商户订单号");
paydata.SetValue("refund_fee", "退款金额：订单总金额，单位为分，只能为整数");
paydata.SetValue("op_user_id", "操作员");
paydata.SetValue("total_fee", "订单金额：订单总金额，单位为分，只能为整数");
orderinfo = await cPay.BaseApi.Refund(paydata);

```

#### 查询退款

``` js

let paydata = new cPay.Model.WxPayData(), orderinfo;
paydata.SetValue("out_refund_no", "商户退款单号");
orderinfo = await cPay.BaseApi.RefundQuery(paydata);

```

#### 短链接生成

``` js

let paydata = new cPay.Model.WxPayData(), orderinfo;
paydata.SetValue("long_url", "需要转换的URL，传输需URL encode");
orderinfo = await cPay.BaseApi.ShortUrl(paydata);

```



