export default class Constant {


    /**
     * https://pay.weixin.qq.com/wiki/doc/api/micropay.php?chapter=9_10&index=1
     * 付款码支付
     * @static
     * @type {string}
     * @memberof Constant
     */
    public static WEIXIN_wxpay_micropay: string = 'https://api.mch.weixin.qq.com/pay/micropay';

    /**
     * https://pay.weixin.qq.com/wiki/doc/api/micropay.php?chapter=9_11&index=3
     * 撤销订单
     * @static
     * @type {string}
     * @memberof Constant
     */
    public static WEIXIN_wxpay_reverse: string = 'https://api.mch.weixin.qq.com/secapi/pay/reverse';

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
     * 查询订单
     * @static
     * @type {string}
     * @memberof Constant
     */
    public static WEIXIN_wxpay_orderquery: string = "https://api.mch.weixin.qq.com/pay/orderquery";


    /**
     *
     * https://pay.weixin.qq.com/wiki/doc/api/tools/cash_coupon.php?chapter=13_4&index=3
     * 发放红包
     * @static
     * @type {string}
     * @memberof Constant
     */
    public static readonly WEIXIN_wxpay_sendredpack: string = "https://api.mch.weixin.qq.com/mmpaymkttransfers/sendredpack";

    /**
     * https://pay.weixin.qq.com/wiki/doc/api/native.php?chapter=9_3
     * 关闭订单
     * 
     * @static
     * @type {string}
     * @memberof Constant
     */
    public static WEIXIN_wxpay_closeorder: string = "https://api.mch.weixin.qq.com/pay/closeorder";

    /**
     * https://pay.weixin.qq.com/wiki/doc/api/native.php?chapter=9_4
     * 申请退款
     * 
     * @static
     * @type {string}
     * @memberof Constant
     */
    public static WEIXIN_wxpay_refund: string = "https://api.mch.weixin.qq.com/secapi/pay/refund";

    /**
     * https://pay.weixin.qq.com/wiki/doc/api/native.php?chapter=9_5
     * 查询退款
     * @static
     * @type {string}
     * @memberof Constant
     */
    public static WEIXIN_wxpay_refundquery: string = "https://api.mch.weixin.qq.com/pay/refundquery";

    /**
     * https://pay.weixin.qq.com/wiki/doc/api/native.php?chapter=9_9&index=10
     * 转换短链接
     * @static
     * @type {string}
     * @memberof Constant
     */
    public static WEIXIN_wxpay_shorturl: string = "https://api.mch.weixin.qq.com/tools/shorturl";


    /**
     * 
     * https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html
     * 微信授权，获取code
     * @static
     * @type {string}
     * @memberof Constant
     */
    public static WEIXIN_auth2_authorize: string = "https://open.weixin.qq.com/connect/oauth2/authorize?";


    /**
     * https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html
     * 根据code获取token、openID
     * @static
     * @type {string}
     * @memberof Constant
     */
    public static WEIXIN_auth2_access_token: string = "https://api.weixin.qq.com/sns/oauth2/access_token?";

    /**
     * https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/Official_Accounts/official_account_website_authorization.html
     * 根据code获取token、openID
     * @static
     * @type {string}
     * @memberof Constant
     */
    public static WEIXIN_auth2_open_access_token: string = "https://api.weixin.qq.com/sns/oauth2/component/access_token";

    /**
     * https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html
     * 刷新Token
     * @static
     * @type {string}
     * @memberof Constant
     */
    public static WEIXIN_auth2_refresh_token: string = "https://api.weixin.qq.com/sns/oauth2/refresh_token?";

    /**
     * https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html
     * 获取微信信息
     * @static
     * @type {string}
     * @memberof Constant
     */
    public static WEIXIN_auth2_userinfo: string = " https://api.weixin.qq.com/sns/userinfo?";

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

    /**
 * 交易类型-H5支付
 * @static
 * @type {string}
 * @memberof Constant
 */
    public static WEIXIN_trade_type_MWEB: string = "MWEB";


    /**
     * 微信开放平台获取令牌
     */
    public static WEIXIN_OPEN_component_token: string = "https://api.weixin.qq.com/cgi-bin/component/api_component_token";

    /**
     * 微信开放平台获取预授权码
     */
    public static WEIXIN_OPEN_create_preauthcode: string = "https://api.weixin.qq.com/cgi-bin/component/api_create_preauthcode?component_access_token={0}";

    /**
     * 公众号撒吗授权入驻开放平台
     */
    public static WEIXIN_OPEN_componentloginpage: string = "https://mp.weixin.qq.com/cgi-bin/componentloginpage?";

    /**
     * 使用授权码获取授权信息
     */
    public static readonly WEIXIN_OPEN_query_auth: string = "https://api.weixin.qq.com/cgi-bin/component/api_query_auth?component_access_token={0}";

    /**
     * 刷新token
     */
    public static readonly WEIXIN_OPEN_refresh_authorizer_token: string = "https://api.weixin.qq.com/cgi-bin/component/api_authorizer_token?component_access_token={0}";

    /**
     * 获取基础信息
     */
    public static readonly WEIXIN_OPEN_get_authorizer_info: string = "https://api.weixin.qq.com/cgi-bin/component/api_get_authorizer_info?component_access_token={0}";

    /**
     * 获取JSSDK 所需ticket
     *
     * @static
     * @type {string}
     * @memberof Constant
     */
    public static readonly WEIXIN_OPEN_GET_JSsdk_ticket: string = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token={0}&type=jsapi";
}
