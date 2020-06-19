
import * as Model from './Model';
import { JsApiPay } from './WechatPay/jsApiPay';
import { NativePay } from './WechatPay/nativePay';
import * as Config from './Config';
import * as Notify from './Notice';

const cPay = {

    JsApiPay,
    NativePay,
    Model,
    Config,
    Notify
    
}

export default cPay;

