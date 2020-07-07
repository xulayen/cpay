import * as cPay_Config from './Config';
import * as  cPay_Util from './Util';
import { format, addSeconds } from 'date-fns';
import * as cPay_Exception from './Exception/wxPayException';
import Constant from './Config/constant';
import * as Model from './Model';
import * as BLL from './BLL/cPayBLL';
import * as Notice from './Notice';
import { RedisKeyEnum } from './Config/redisKey';

export class WxOpenApi {

    constructor() {


    }

    /**
     * 获取令牌
     * @param appid 第三方平台 appid
     * @param appsecret 第三方平台 appsecret
     * @param ticket 微信后台推送的 ticket
     */
    public static async GetComponent_access_token(): Promise<string> {
        let Config: cPay_Config.IWxConfig = cPay_Config.Config.GetWxPayConfig();
        let url = Constant.WEIXIN_OPEN_component_token,
            accept = new Notice.WxOpenPlatformAccept(),
            redis = cPay_Util.Util.redisClient,
            ticket = await accept.Ticket(),
            component_access_token = await cPay_Util.Util.redisClient.get(RedisKeyEnum.redis_key_component_access_token);

        if (component_access_token) {
            return component_access_token;
        }

        if (ticket) {
            let res = await cPay_Util.Util.setMethodWithUri({
                url: url,
                method: 'post',
                json: true,
                data: {
                    component_appid: Config.GetOpenAppid(),
                    component_appsecret: Config.GetOpenAppsecret(),
                    component_verify_ticket: ticket
                }
            });

            let obj_res = {
                component_access_token: res && res.component_access_token,
                expires_in: res && res.expires_in - 1000
            };

            redis.set(RedisKeyEnum.redis_key_component_access_token, obj_res.component_access_token, obj_res.expires_in);

            return obj_res.component_access_token;

        }

        throw new cPay_Exception.WxOpenPlatformException("票据不存在！");

    }

    /**
     * 获取预授权码
     */
    public static async GetPre_auth_code(): Promise<string> {
        let Config: cPay_Config.IWxConfig = cPay_Config.Config.GetWxPayConfig(),
            component_access_token = await this.GetComponent_access_token(),
            url = cPay_Util.Util.format(Constant.WEIXIN_OPEN_create_preauthcode, component_access_token),
            pre_auth_code = await cPay_Util.Util.redisClient.get(RedisKeyEnum.redis_key_Pre_auth_code);

        if (pre_auth_code) {
            return pre_auth_code;
        }

        console.log(component_access_token);


        let res = await cPay_Util.Util.setMethodWithUri({
            url: url,
            method: 'post',
            json: true,
            data: {
                component_appid: Config.GetOpenAppid(),
                component_access_token: component_access_token,
            }
        });

        console.log(res);


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
        let Config: cPay_Config.IWxConfig = cPay_Config.Config.GetWxPayConfig();
        let access_token = await this.GetComponent_access_token(),
            url = cPay_Util.Util.format(Constant.WEIXIN_OPEN_query_auth, access_token),
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
            data: {
                component_appid: Config.GetOpenAppid(),
                component_access_token: access_token,
                authorization_code: authcode
            }
        });

        console.log(res);

        if (!res.authorization_info) {
            return res;
        }

        res = res.authorization_info;

        let obj_res = {
            authorizer_appid: res && res.authorizer_appid,
            authorizer_access_token: res && res.authorizer_access_token,
            authorizer_refresh_token: res && res.authorizer_refresh_token
        }, input = {
            appid: obj_res.authorizer_appid,
            access_token: obj_res.authorizer_access_token,
            refresh_token: obj_res.authorizer_refresh_token,
            expires_in: res.expires_in,
            expires_time: format(addSeconds(new Date(), res.expires_in), "yyyy-MM-dd HH:mm:ss")
        };


        BLL.CpayOpenBLL.InsertOpenAuth(input);
        this.UpdateRedisToken(input);

        return obj_res.authorizer_access_token;
    }

    private static UpdateRedisToken(input: any) {
        cPay_Util.Util.redisClient.set(cPay_Util.Util.format(RedisKeyEnum.redis_key_authorizer_access_token, input.appid), input.access_token, input.expires_in - 1000);
        cPay_Util.Util.redisClient.set(cPay_Util.Util.format(RedisKeyEnum.redis_key_refresh_authorizer_access_token, input.appid), input.refresh_token, 60 * 60 * 24 * 30);
    }

    private static start: boolean = false;
    /**
     * 主动轮询将要过期的Token，并主动刷新
     * @static
     * @returns {Promise<void>}
     * @memberof WxOpenApi
     */
    public static async ProcessingFailure(): Promise<void> {

        if (this.start) {
            return;
        }
        this.start = !this.start;


        setInterval(async () => {

            console.log('15分钟执行一次！');
            let res = await BLL.CpayOpenBLL.SelectWillExpireToken();

            for (let i = 0; i < res.length; i++) {
                let current = res[i];
                await this.RefeshAuthorizer_access_token(current);
            }



        }, 1000 * 60 * 15)

    }

    private static async RefeshAuthorizer_access_token(current: any): Promise<void> {
        let Config: cPay_Config.IWxConfig = cPay_Config.Config.GetWxPayConfig();
        let component_access_token = await cPay_Util.Util.redisClient.get(RedisKeyEnum.redis_key_component_access_token);
        let url = cPay_Util.Util.format(Constant.WEIXIN_OPEN_refresh_authorizer_token, component_access_token);
        let res = await cPay_Util.Util.setMethodWithUri({
            url: url,
            method: 'post',
            json: true,
            data: {
                component_appid: Config.GetOpenAppid(),
                component_access_token: component_access_token,
                authorizer_appid: current.appid,
                authorizer_refresh_token: current.refresh_token
            }
        });

        if (!res.authorizer_access_token || !res.authorizer_refresh_token) {
            return;
        }

        let input = {
            access_token: res.authorizer_access_token,
            refresh_token: res.authorizer_refresh_token,
            expires_in: res.expires_in,
            appid: current.appid,
            expires_time: format(addSeconds(new Date(), res.expires_in), "yyyy-MM-dd HH:mm:ss")
        };

        //在这里更新数据库

        BLL.CpayOpenBLL.UpdateWillExpireToken(input)

        this.UpdateRedisToken(input);

    }


}