export default class Constant {
    /**
     * https://pay.weixin.qq.com/wiki/doc/api/native.php?chapter=6_4
     * 扫码支付模式1接口
     * @static
     * @type {string}
     * @memberof Constant 
     * 
     */
    public static WEIXIN_wxpay_bizpayurl: string = 'weixin://wxpay/bizpayurl?';

    /**
     * https://pay.weixin.qq.com/wiki/doc/api/native.php?chapter=9_1
     * 统一下单接口
     * @static
     * @type {string}
     * @memberof Constant
     */
    public static WEIXIN_wxpay_unifiedorder: string = "https://api.mch.weixin.qq.com/pay/unifiedorder";


    /**
     * https://pay.weixin.qq.com/wiki/doc/api/native.php?chapter=9_2
     * 2、查询订单
     * @static
     * @type {string}
     * @memberof Constant
     */
    public static WEIXIN_wxpay_orderquery: string = "https://api.mch.weixin.qq.com/pay/orderquery";

    /**
     *
     *
     * @static
     * @type {string} 交易类型-JSAPI支付
     * @memberof Constant
     */
    public static WEIXIN_trade_type_JSAPI: string = "JSAPI";

    /**
     *交易类型-Native支付
     * @static
     * @type {string}
     * @memberof Constant
     */
    public static WEIXIN_trade_type_NATIVE: string = "NATIVE";

    /**
     * 交易类型-APP支付
     * @static
     * @type {string}
     * @memberof Constant
     */
    public static WEIXIN_trade_type_APP: string = "APP";

}