
import * as Model from './lib/Model';
import { JsApiPay } from './lib/WechatPay/jsApiPay';
import { NativePay } from './lib/WechatPay/nativePay';
import { H5Pay } from './lib/WechatPay/h5Pay';
import { WxaPay } from './lib/WechatPay/wxaPay';
import { AppPay } from './lib/WechatPay/appPay';
import { MicroPay } from './lib/WechatPay/microPay';
import { SendRedpack } from './lib/WechatPay/sendRedpack';
import * as Config from './lib/Config';
import * as Notify from './lib/Notice';
import { WxPayApi } from './lib/wxPayApi';
import { ComponentLogin } from './lib/WechatOpen/componentLogin';
import { AccountWebsiteAuth } from './lib/WechatOpen/accountWebsiteAuth';
import { JssdkSign } from './lib/WechatOpen/jssdkSign';

import * as AliPay from './lib/AliPay';

import { Util } from './lib/Util';

const cPay = {

    JsApiPay,
    NativePay,
    H5Pay,
    WxaPay,
    AppPay,
    MicroPay,
    SendRedpack,
    Model,
    Config,
    Notify,
    ComponentLogin,
    AccountWebsiteAuth,
    JssdkSign,
    BaseWxApi: WxPayApi,
    AliPay,
    Util

}

export default cPay;

