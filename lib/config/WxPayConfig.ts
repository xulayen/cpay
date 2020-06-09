
namespace cPay {
    export class WxPayConfig {
        static config: IConfig;

        static GetConfig(): IConfig {
            if (this.config === null)
                this.config = new DemoConfig();
            return this.config;
        }

    }
}