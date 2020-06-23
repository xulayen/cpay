
import * as Model from './Model';
import { JsApiPay } from './WechatPay/jsApiPay';
import { NativePay } from './WechatPay/nativePay';
import { H5Pay } from './WechatPay/h5Pay';
import * as Config from './Config';
import * as Notify from './Notice';
import { WxPayApi } from './WxPayApi';

const cPay = {

    JsApiPay,
    NativePay,
    H5Pay,
    Model,
    Config,
    Notify,
    BaseApi: WxPayApi

}

export default cPay;
