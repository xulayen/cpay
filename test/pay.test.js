var cPay = require('../dist/lib').default;
var Config = require('../dist/test/config').default;
const assert = require('assert');



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

new cPay.Config.WeixinPayConfig(weixin);
new cPay.Config.RedisConfig(Config.redis.host, Config.redis.port, Config.redis.db);
new cPay.Config.MySqlConfig(Config.mySql.host, Config.mySql.user, Config.mySql.pwd, Config.mySql.db);



describe('Array', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});



describe('微信支付', function () {
  describe('#H5支付', function () {
    it('返回SUCCESS', async function () {
      let h5Pay = new cPay.H5Pay(),
        scene = new cPay.Model.SceneInfo("11", "22", "444");
      h5Pay.orderInfo = new cPay.Model.OrderInfo();
      h5Pay.orderInfo.body = "1111111";
      h5Pay.orderInfo.total_fee = 1;
      let res = await h5Pay.UnifiedOrder(new Date().getTime(), scene, "http://baidu.com/");
      assert.equal(res.return_code, "SUCCESS");
    });
  });
});


describe('微信支付', function () {
  describe('#扫码支付-模式1', function () {
    it('返回扫码支付模式1URL', async function () {
      let nativepay = new cPay.NativePay();
      nativepay.orderInfo = new cPay.Model.OrderInfo();
      nativepay.orderInfo.body = "商品描述";
      nativepay.orderInfo.total_fee = 1;
      nativepay.orderInfo.attach = "附件信息";
      nativepay.orderInfo.detail = "详细信息";
      nativepay.orderInfo.goods_tag = "测试";
      let url = await nativepay.GetPrePayUrl("111111");
      assert.equal(url.indexOf('weixin://wxpay/bizpayurl?') > -1, true);
    });
  });
});


describe('微信支付', function () {
  describe('#扫码支付-模式2', function () {
    it('返回扫码支付模式2URL', async function () {
      let nativepay = new cPay.NativePay();
      nativepay.orderInfo = new cPay.Model.OrderInfo();
      nativepay.orderInfo.body = "商品描述";
      nativepay.orderInfo.total_fee = 1;
      nativepay.orderInfo.attach = "附件信息";
      nativepay.orderInfo.detail = "详细信息";
      nativepay.orderInfo.goods_tag = "测试";
      let url = await nativepay.GetPayUrl("111111");
      assert.equal(url.indexOf('weixin://wxpay/bizpayurl?') > -1, true);
    });
  });
});


describe('微信支付', function () {
  describe('#付款码支付', function () {
    it('返回SUCCESS', async function () {
      let microPay = new cPay.MicroPay();
      microPay.orderInfo = new cPay.Model.OrderInfo();
      microPay.orderInfo.body = "99999999";
      microPay.orderInfo.total_fee = 1;
      microPay.orderInfo.attach = "56565656565";
      microPay.orderInfo.detail = "bb";
      microPay.orderInfo.goods_tag = "aa";
      let res = await microPay.Scan(new Date().getTime().toString(), "1111111111111111111111");
      assert.equal(res.return_code, "SUCCESS");
    });
  });
});



describe('微信支付', function () {
  describe('#APP支付', function () {
    it('返回SUCCESS', async function () {
      let appPay = new cPay.AppPay();
      appPay.orderInfo = new cPay.Model.OrderInfo();
      appPay.orderInfo.body = "99999999";
      appPay.orderInfo.total_fee = 1;
      appPay.orderInfo.attach = "vvvv";
      appPay.orderInfo.detail = "bb";
      appPay.orderInfo.goods_tag = "aa";
      let res = await appPay.UnifiedOrder(new Date().getTime(), { device_info: "111" })
      assert.equal(res.return_code, "FAIL");
    });
  });
});



describe('微信支付', function () {
  describe('#查询订单', function () {
    it('返回SUCCESS', async function () {
      let paydata = new cPay.Model.WxPayData();
      paydata.SetValue("out_trade_no", "20200702132115534");

      let res = await cPay.BaseApi.OrderQuery(paydata);
      assert.equal(res.return_code, "SUCCESS");
    });
  });
});


describe('微信支付', function () {
  describe('#关闭订单', function () {
    it('返回SUCCESS', async function () {
      let paydata = new cPay.Model.WxPayData(), res;
      paydata.SetValue("out_trade_no", "20200702132115534");
      res = await cPay.BaseApi.CloseOrder(paydata);
      assert.equal(res.return_code, "SUCCESS");
    });
  });
});

describe('微信支付', function () {
  describe('#申请退款', function () {
    it('返回SUCCESS', async function () {
      let paydata = new cPay.Model.WxPayData(), res;
      paydata.SetValue("out_refund_no", "111");
      paydata.SetValue("out_trade_no", "20200702132339194");
      paydata.SetValue("refund_fee", "1");
      paydata.SetValue("op_user_id", "徐大腿");
      paydata.SetValue("total_fee", "1");
      res = await cPay.BaseApi.Refund(paydata);
      assert.equal(res.return_code, "SUCCESS");
    });
  });
});


describe('微信支付', function () {
  describe('#退款查询', function () {
    it('返回SUCCESS', async function () {
      let paydata = new cPay.Model.WxPayData(), res;
      paydata.SetValue("out_refund_no", "111");
      res = await cPay.BaseApi.RefundQuery(paydata);
      assert.equal(res.return_code, "SUCCESS");
    });
  });
});


describe('微信支付', function () {
  describe('#短链接生成', function () {
    it('返回SUCCESS', async function () {
      let paydata = new cPay.Model.WxPayData(), res;
      paydata.SetValue("long_url", "weixin://wxpay/bizpayurl?appid=wx6e8dfa0d32f32337&mch_id=1499013532&nonce_str=1593747033402&product_id=111111&time_stamp=1593747033695&sign=8120fb8002de5ce49af213c5ca0d3b6c");
      res = await cPay.BaseApi.ShortUrl(paydata);
      assert.equal(res.return_code, "SUCCESS");
    });
  });
});


describe('Array', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal([1, 2, 3].indexOf(4), -1);
      setTimeout(function () {
        process.exit(0);
      }, 5000);

    });
  });
});


