import * as cPay_Config from './Config';
import * as  cPay_Util from './Util';
import { format } from 'date-fns';
import * as cPay_Exception from './Exception/wxPayException';
import Constant from './Config/constant';
import * as Model from './Model';
import * as BLL from './BLL/cPayBLL';
import * as Notice from './Notice';
import { RedisKeyEnum } from './Config/redisKey';

export class WxOpenApi {
    private static Config: cPay_Config.IWxConfig = cPay_Config.Config.GetWxPayConfig();
    constructor() {

    }

    /**
     * 获取令牌
     * @param appid 第三方平台 appid
     * @param appsecret 第三方平台 appsecret
     * @param ticket 微信后台推送的 ticket
     */
    public static async GetComponent_access_token(): Promise<string> {
        let url = Constant.WEIXIN_OPEN_component_token,
            accept = new Notice.WxOpenPlatformAccept(),
            redis: cPay_Util.RedisClient = cPay_Util.Util.redisClient,
            ticket = accept.Ticket();
        if (!ticket) {
            let res = await cPay_Util.Util.setMethodWithUri({
                url: url,
                method: 'post',
                json: true,
                body: {
                    component_appid: this.Config.GetOpenAppid(),
                    component_appsecret: this.Config.GetOpenAppsecret(),
                    component_verify_ticket: accept.Ticket()
                }
            });

            let obj_res = {
                component_access_token: res && res.component_access_token,
                expires_in: res && res.expires_in - 1000
            };

            redis.set(RedisKeyEnum.redis_key_component_access_token, obj_res.component_access_token, obj_res.expires_in);

            return obj_res.component_access_token;

        }

        return ticket;

    }

    /**
     * 获取预授权码
     */
    public static async GetPre_auth_code(): Promise<string> {
        let url = Constant.WEIXIN_OPEN_create_preauthcode;
        let component_access_token = await cPay_Util.Util.redisClient.get(RedisKeyEnum.redis_key_component_access_token);

        let pre_auth_code = await cPay_Util.Util.redisClient.get(RedisKeyEnum.redis_key_Pre_auth_code);
        if (pre_auth_code) {
            return pre_auth_code;
        }

        if (!component_access_token) {
            component_access_token = await this.GetComponent_access_token();
        }

        let res = await cPay_Util.Util.setMethodWithUri({
            url: url,
            method: 'post',
            json: true,
            body: {
                component_appid: this.Config.GetOpenAppid(),
                component_access_token: component_access_token,
            }
        });

        let obj_res = {
            pre_auth_code: res && res.pre_auth_code,
            expires_in: res && res.expires_in - 100
        }

        cPay_Util.Util.redisClient.set(RedisKeyEnum.redis_key_Pre_auth_code, obj_res.pre_auth_code, obj_res.expires_in);

        return obj_res.pre_auth_code;
    }


    /**
     * 使用授权码获取授权信息
     */
    public static async GetAuthorizer_access_token(): Promise<string> {
        let url = Constant.WEIXIN_OPEN_query_auth,
            access_token = await this.GetComponent_access_token(),
            authcode = await cPay_Util.Util.redisClient.get(RedisKeyEnum.redis_key_auth_code);

        if (!access_token) {
            throw new cPay_Exception.WxOpenPlatformException("令牌不存在！");
        }

        if (!authcode) {
            throw new cPay_Exception.WxOpenPlatformException("授权码不存在");
        }

        let authorizer_access_token = await cPay_Util.Util.redisClient.get(RedisKeyEnum.redis_key_authorizer_access_token);

        if (authorizer_access_token) {
            return authorizer_access_token;
        }

        let res = await cPay_Util.Util.setMethodWithUri({
            url: url,
            method: 'post',
            json: true,
            body: {
                component_appid: this.Config.GetOpenAppid(),
                component_access_token: access_token,
                authorization_code: authcode
            }
        });

        let obj_res = {
            authorizer_appid: res && res.authorizer_appid,
            authorizer_access_token: res && res.authorizer_access_token,
            authorizer_refresh_token: res && res.authorizer_refresh_token,
            expires_in: res && res.expires_in - 1000
        }

        cPay_Util.Util.redisClient.set(RedisKeyEnum.redis_key_authorizer_access_token, obj_res.authorizer_access_token, obj_res.expires_in);
        cPay_Util.Util.redisClient.set(RedisKeyEnum.redis_key_refresh_authorizer_access_token, obj_res.authorizer_refresh_token, 60 * 60 * 24 * 30);

        return obj_res.authorizer_access_token;
    }

    private static async RefeshAuthorizer_access_token(auth: any, access_token: string) {
        let url = Constant.WEIXIN_OPEN_refresh_authorizer_token;
        let res = await cPay_Util.Util.setMethodWithUri({
            url: url,
            method: 'post',
            json: true,
            body: {
                component_appid: this.Config.GetOpenAppid(),
                component_access_token: access_token,
                authorizer_appid: auth.authorizer_appid,
                authorizer_refresh_token: auth.authorizer_refresh_token
            }
        });

    }


}