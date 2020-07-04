
import * as OpenApi from '../wxOpenApi';
import Constant from '../Config/constant';
import * as  cPay_Model from '../Model';
import * as  cPay_Config from '../Config';
import * as  cPay_Util from '../Util';
const WxPayData = cPay_Model.WxPayData;

/***
 * wx9a1a29d63b33cd3d
 * 登录授权的发起页域名wxauth.xulayen.com
 * 授权事件接收URLhttp://accept.xulayen.com/ticket
 * 消息校验Token0b2bcc26491d45f3a65d3e0d520ab3ed
 * 消息加解密Key7deb81f3efec4182aeeb436314632ac28av5fre7ace
 * 消息与事件接收URL http://accept.xulayen.com/callback/$APPID$/
 * 公众号开发域名 public.xulayen.com
 * 
 * 
 */
export class ComponentLogin {

    private request: any;
    private response: any;
    private next: any;
    private config: cPay_Config.IWxConfig;
    private readonly redis_key_auth_code = "cpay:wxopen:auth_code";
    constructor(request: any, response: any, next: any) {
        this.request = request;
        this.response = response;
        this.next = next;
        this.config = cPay_Config.Config.GetWxPayConfig();
    }

    /**
     * 引入用户进入授权页
     * @param redirect_uri 回调地址
     */
    public async AuthLogin(redirect_uri: string) {
        let auth_code = await OpenApi.WxOpenApi.GetPre_auth_code(),
            url = Constant.WEIXIN_OPEN_componentloginpage, data = new WxPayData();
        data.SetValue("component_appid", this.config.GetOpenAppid());
        data.SetValue("pre_auth_code", auth_code);
        data.SetValue("redirect_uri", redirect_uri);
        let res_url = `${url}${data.ToUrl()}`;
        console.log("Will Redirect to URL : " + res_url);
        this.response.redirect(res_url);
        return;
    }

    /**
     * 用户授权完成回调
     */
    public AuthLoginCallBack(): void {
        let auth_code = this.request.query.auth_code,
            expires_in = this.request.query.expires_in;
        // 存入数据
        cPay_Util.Util.redisClient.set(this.redis_key_auth_code, auth_code, expires_in - 100);
    }



}