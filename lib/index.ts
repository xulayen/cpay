
import * as Model from './Model';
import { JsApiPay } from './WechatPay/jsApiPay';
import { NativePay } from './WechatPay/nativePay';
import * as Config from './Config';
import * as Notify from './Notice';
import { WxPayApi } from './WxPayApi';

const cPay = {

    JsApiPay,
    NativePay,
    Model,
    Config,
    Notify,
    BaseApi: WxPayApi

}

export default cPay;

