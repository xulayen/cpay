

export enum RedisKeyEnum {
    /**
     * 票据
     */
    redis_key_ticket = 'cpay:wxopen:ticket',

    /**
     * 令牌
     */
    redis_key_component_access_token = "cpay:wxopen:token",

    /**
     * 预授权码
     */
    redis_key_Pre_auth_code = "cpay:wxopen:pre_auth_code",

    /**
     * 授权码
     */
    redis_key_auth_code = "cpay:wxopen:auth_code",

    /**
     * 接口调用令牌
     */
    redis_key_authorizer_access_token = "cpay:wxopen:authorizer_access_token",

    /**
     * 接口刷新令牌
     */
    redis_key_refresh_authorizer_access_token = "cpay:wxopen:refresh_authorizer_access_token"

}