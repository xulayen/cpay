

export namespace cPay_Config {
    export interface IConfig {

        //=======【基本信息设置】=====================================
        /* 微信公众号信息配置
        * APPID：绑定支付的APPID（必须配置）
        * MCHID：商户号（必须配置）
        * KEY：商户支付密钥，参考开户邮件设置（必须配置），请妥善保管，避免密钥泄露
        * APPSECRET：公众帐号secert（仅JSAPI支付的时候需要配置），请妥善保管，避免密钥泄露
        */
        GetAppID(): string;
        GetMchID(): string;
        GetKey(): string;
        GetAppSecret(): string;

        //=======【证书路径设置】===================================== 
        /* 证书路径,注意应该填写绝对路径（仅退款、撤销订单时需要）
         * 1.证书文件不能放在web服务器虚拟目录，应放在有访问权限控制的目录中，防止被他人下载；
         * 2.建议将证书文件名改为复杂且不容易猜测的文件
         * 3.商户服务器要做好病毒和木马防护工作，不被非法侵入者窃取证书文件。
        */
        GetSSlCertPath(): string;
        GetSSlCertPassword(): string;



        //=======【支付结果通知url】===================================== 
        /* 支付结果通知回调url，用于商户接收支付结果
        */
        GetNotifyUrl(): string;

        //=======【商户系统后台机器IP】===================================== 
        /* 此参数可手动配置也可在程序中自动获取
        */
        GetIp(): string;


        //=======【代理服务器设置】===================================
        /* 默认IP和端口号分别为0.0.0.0和0，此时不开启代理（如有需要才设置）
        */
        GetProxyUrl(): string;


        //=======【上报信息配置】===================================
        /* 测速上报等级，0.关闭上报; 1.仅错误时上报; 2.全量上报
        */
        GetReportLevel(): string;


        //=======【日志级别】===================================
        /* 日志等级，0.不输出日志；1.只输出错误信息; 2.输出错误和正常信息; 3.输出错误信息、正常信息和调试信息
        */
        GetLogLevel(): string;

    }

    export class DemoConfig implements IConfig {
        GetAppID(): string {
            return "wxc46c96addcb23ab9";
        }
        GetMchID(): string {
            return "1305176001";
        }
        GetKey(): string {
            return "CYRYFWCXtoken130826";
        }
        GetAppSecret(): string {
            return "d4624c36b6795d1d99dcf0547af5443d";
        }
        GetSSlCertPath(): string {
            return "E:\\工作\\workpace\\txz\\txz2020\\src\\assets\\images\\oao\\bg1.png";
        }
        GetSSlCertPassword(): string {
            return "1111";
        }
        GetNotifyUrl(): string {
            return "111";
        }
        GetIp(): string {
            return "10.20.26.19";
        }
        GetProxyUrl(): string {
            return "";
        }
        GetReportLevel(): string {
            return "";
        }
        GetLogLevel(): string {
            return "";
        }

    }

    export class WxPayConfig {
        private static config: IConfig;

        constructor() {
   
        }

        public static GetConfig(): IConfig {
            if (!this.config)
                this.config = new DemoConfig();
            return this.config;
        }

    }
}