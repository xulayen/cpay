
import * as Model from './lib/Model';
import { JsApiPay } from './lib/WechatPay/jsApiPay';
import { NativePay } from './lib/WechatPay/nativePay';
import { H5Pay } from './lib/WechatPay/h5Pay';
import { WxaPay } from './lib/WechatPay/wxaPay';
import { AppPay } from './lib/WechatPay/appPay';
import { MicroPay } from './lib/WechatPay/microPay';
import * as Config from './lib/Config';
import * as Notify from './lib/Notice';
import { WxPayApi } from './lib/WxPayApi';

const cPay = {

    JsApiPay,
    NativePay,
    H5Pay,
    WxaPay,
    AppPay,
    MicroPay,
    Model,
    Config,
    Notify,
    BaseApi: WxPayApi

}

export default cPay;

