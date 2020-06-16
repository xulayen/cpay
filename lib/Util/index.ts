const rp = require('request-promise');
const fs = require('fs'),
    path = require('path');

export namespace cPay_Util {

    export class Util {
        static async ErrorInterceptors(err) {
            return err;
        }

        public static async setMethodWithUri(option) {

            let certFile, cert;
            if (option.cert) {
                certFile = path.resolve(option.cert);
                cert = {
                    cert: fs.readFileSync(certFile),
                    passphrase: option.password
                };
            }

            var __option = {
                url: option.url,
                method: option.method,
                json: option.json || false,
                headers: {
                    ...option.headers
                },
                ...cert,
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

       public static ToUrlParams(map: any) {
            let buff = "";
            map.forEach(function (value, key) {
                if (!value) {
                    throw new Error("WxPayData内部含有值为null的字段!");
                }
                if (value != "") {
                    buff += key + "=" + value + "&";
                }

            });

            buff = buff.trim();
            return buff;
        }
    }

}