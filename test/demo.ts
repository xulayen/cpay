import { cPay_NativePay } from '../lib/WechatPay/nativePay';
import { cPay_JsApiPay } from '../lib/WechatPay/jsApiPay';
import { cPay } from '../lib/wxPayApi';
import { cPay_Notice } from '../lib/Notice/notify';
const NativePay = cPay_NativePay.nativePay;
const JsApiPay = cPay_JsApiPay.JsApiPay;
const WxPayApi = cPay.WxPayApi;

async function Unit() {


  /****
   * 单元测试 
   * 1、转义XML2Obj
   */
  var xml_res = `<xml>
 <appid><![CDATA[wx2421b1c4370ec43b]]></appid>
 <attach><![CDATA[支付测试]]></attach>
 <bank_type><![CDATA[CFT]]></bank_type>
 <fee_type><![CDATA[CNY]]></fee_type>
 <is_subscribe><![CDATA[Y]]></is_subscribe>
 <mch_id><![CDATA[10000100]]></mch_id>
 <nonce_str><![CDATA[5d2b6c2a8db53831f7eda20af46e531c]]></nonce_str>
 <openid><![CDATA[oUpF8uMEb4qRXf22hE3X68TekukE]]></openid>
 <out_trade_no><![CDATA[1409811653]]></out_trade_no>
 <result_code><![CDATA[SUCCESS]]></result_code>
 <return_code><![CDATA[SUCCESS]]></return_code>
 <sign><![CDATA[B552ED6B279343CB493C5DD0D78AB241]]></sign>
 <time_end><![CDATA[20140903131540]]></time_end>
 <total_fee>1</total_fee>
 <coupon_fee><![CDATA[10]]></coupon_fee>
 <coupon_count><![CDATA[1]]></coupon_count>
 <coupon_type><![CDATA[CASH]]></coupon_type>
 <coupon_id><![CDATA[10000]]></coupon_id>
 <coupon_fee><![CDATA[100]]></coupon_fee>
 <trade_type><![CDATA[JSAPI]]></trade_type>
 <transaction_id><![CDATA[1004400740201409030005092168]]></transaction_id>
</xml>`;
  let api = new cPay.WxPayData();
  let a = await api.FromXml(xml_res);
  console.log(a);


  xml_res = `<xml>
    <appid><![CDATA[wx2421b1c4370ec43b]]></appid>
    <product_id><![CDATA[123456]]></product_id>
    <attach><![CDATA[支付测试]]></attach>
    <bank_type><![CDATA[CFT]]></bank_type>
    <fee_type><![CDATA[CNY]]></fee_type>
    <is_subscribe><![CDATA[Y]]></is_subscribe>
    <mch_id><![CDATA[10000100]]></mch_id>
    <nonce_str><![CDATA[5d2b6c2a8db53831f7eda20af46e531c]]></nonce_str>
    <openid><![CDATA[oUpF8uMEb4qRXf22hE3X68TekukE]]></openid>
    <out_trade_no><![CDATA[1409811653]]></out_trade_no>
    <result_code><![CDATA[SUCCESS]]></result_code>
    <return_code><![CDATA[SUCCESS]]></return_code>
    <sign><![CDATA[B552ED6B279343CB493C5DD0D78AB241]]></sign>
    <time_end><![CDATA[20140903131540]]></time_end>
    <total_fee>1</total_fee>
    <coupon_fee><![CDATA[10]]></coupon_fee>
    <coupon_count><![CDATA[1]]></coupon_count>
    <coupon_type><![CDATA[CASH]]></coupon_type>
    <coupon_id><![CDATA[10000]]></coupon_id>
    <coupon_fee><![CDATA[100]]></coupon_fee>
    <trade_type><![CDATA[NATIVE]]></trade_type>
    <transaction_id><![CDATA[1004400740201409030005092168]]></transaction_id>
  </xml>`;
  /****
   * 2、测试回调
   */
  // let c = new cPay_Notice.NativeNotify({ body: xml_res }, null, null);
  // c.ProcessNotify();



  /*****
   * 3、扫码支付模式1
   */
  // console.log('扫码支付模式1');
  // let native = new NativePay();
  // let url = native.GetPrePayUrl('123456');

  /****
   * 3、扫码支付模式2
   */
  // console.log('扫码支付模式2');
  // let native = new NativePay();
  // let url = native.GetPayUrl('123456');



  /*****
   * 4、查询订单
   */
  // console.log('查询订单');
  // let data=new cPay.WxPayData();
  // data.SetValue('transaction_id',"1008450740201411110005820873");
  // WxPayApi.OrderQuery(data);

  /*****
   * 5、关闭订单
   */
  // console.log('关闭订单');
  // let data=new cPay.WxPayData();
  // data.SetValue('out_trade_no',"1008450740201411110005820873");
  // WxPayApi.CloseOrder(data);

  /*****
   * 6、申请退款
   */
  // console.log('申请退款');
  // let data = new cPay.WxPayData();
  // data.SetValue('out_refund_no', "1008450740201411110005820873");
  // data.SetValue('total_fee', "1008450740201411110005820873");
  // data.SetValue('refund_fee', "1008450740201411110005820873");
  // data.SetValue('op_user_id', "1008450740201411110005820873");
  // data.SetValue('transaction_id', "1008450740201411110005820873");
  // WxPayApi.Refund(data);



  /*****
   * 7、查询退款
   */
  // console.log('关闭订单');
  // let data=new cPay.WxPayData();
  // data.SetValue('out_trade_no',"1008450740201411110005820873");
  // WxPayApi.RefundQuery(data);

  /*****
   * 8、统一下单
   */
  // console.log('统一订单');
  // let data = new cPay.WxPayData();
  // data.SetValue('out_trade_no', "1008450740201411110005820873");
  // data.SetValue('body', "1008450740201411110005820873");
  // data.SetValue('total_fee', 100);
  // data.SetValue('trade_type', "JSAPI");
  // data.SetValue('openid', "111111111111");
  // WxPayApi.UnifiedOrder(data);


  /*****
 * 9、短链接
 */
  // console.log('获取短链接');
  // let data = new cPay.WxPayData();
  // data.SetValue('long_url', "weixin://wxpay/appid=wx2421b1c4370ec43b&body=1008450740201411110005820873&mch_id=1305176001&nonce_str=1592209651351&notify_url=111&openid=111111111111&out_trade_no=1008450740201411110005820873&sign_type=HMAC-SHA256&spbill_create_ip=10.20.26.19&total_fee=100&trade_type=JSAPI");
  // WxPayApi.ShortUrl(data);



  /*****
   * 
   */
  console.log('获取OPENID');
  let req = {

    query: {
      code: ''
    },
    protocol:'http',
    headers:{
      host:'baidu.com'
    },
    originalUrl:'/'

  }, res = {}, next = {};
  let jsapi = new JsApiPay(req, res, next);
  await jsapi.GetOpenidAndAccessToken();

}

Unit();



