const rp = require('request-promise');
export namespace cPay_Util {

    export class Util {
        static async ErrorInterceptors(err) {
            return err;
        }

        public static async setMethodWithUri(option) {

            var __option = {
                url: option.url,
                method: option.method,
                json: option.json || false,
                headers: {
                    ...option.headers
                },
                body: option.data
            }

            const reqPromiseOpt = Object.assign({}, __option, {
                transform: function (body, res, resolveWithFullResponse) {
                    return body;
                }
            });

            try {

                return rp(reqPromiseOpt).catch(this.ErrorInterceptors);


            } catch (e) {
                console.error(e);

            }


        }
    }

}