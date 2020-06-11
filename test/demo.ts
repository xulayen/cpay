import { cPay_NativePay } from '../lib/nativePay/NativePay';
import { cPay } from '../lib/WxPayApi';

// const NativePay=cPay_NativePay.NativePay;
// console.log('hello world!');
// let native = new NativePay();
// let url = native.GetPrePayUrl('123456');


/****
 * 单元测试
 */

var res = `<xml>
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
debugger;
let a = api.FromXml(res);
a.then(function (b) {
    console.log(b)
});





