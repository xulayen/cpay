export namespace cPay_Exception {
    export class WxPayException extends Error {
        constructor(message) {
            super(message);
        }
    }
}