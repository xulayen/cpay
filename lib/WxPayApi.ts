namespace cPay {
    export class WxPayApi {
        static GenerateTimeStamp(): string {
            return (new Date().getTime() + (Math.random() * 1000)) + "";
        }

        /**
        * 生成随机串，随机串包含字母或数字
        * @return 随机串
        */
        static GenerateNonceStr(): string {
            return (new Date().getTime() + (Math.random() * 1000)) + "";
        }
    }
}