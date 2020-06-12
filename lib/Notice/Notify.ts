import { cPay } from '../WxPayApi';
import { cPay_Config } from '../Config/WxPayConfig';
import { format } from 'date-fns';
import Constant from '../Config/Constant';
import { cPay_Model } from '../Model';

export namespace cPay_Notice {

    const WxPayData = cPay.WxPayData;
    const WxPayApi = cPay.WxPayApi;
    const config = cPay_Config.WxPayConfig.GetConfig();

    /**
     * @class 回调处理基类
     * 主要负责接收微信支付后台发送过来的数据，对数据进行签名验证
     * 子类在此类基础上进行派生并重写自己的回调处理过程
     */
    class Notify {

        protected request: any;
        protected response: any;
        protected next: any;
        constructor(request, response, next) {
            this.request = request;
            this.response = response;
            this.next = next;
        }

        public async ProcessNotify(): Promise<void> {

        }

        async GetNotifyData(): Promise<cPay.WxPayData> {

            let builder = this.request.body, data = new WxPayData();
            try {
                await data.FromXml(builder.toString());
            } catch (ex) {
                console.error(ex);
                //若签名错误，则立即返回结果给微信支付后台
                let res = new WxPayData();
                res.SetValue("return_code", "FAIL");
                res.SetValue("return_msg", ex.Message);
                console.error("Sign check error : " + res.ToXml());
                this.response.send(res.ToXml());
                return;
            }
            return data;

        }

    }


    /**
     * @export 扫码支付模式一回调处理类；接收微信支付后台发送的扫码结果，调用统一下单接口并将下单结果返回给微信支付后台
     * @class NativeNotify 
     * @extends {Notify}
     */
    export class NativeNotify extends Notify {

        constructor(request, response, next) {
            super(request, response, next);
        }

        public async ProcessNotify(): Promise<void> {

            let notifyData = await super.GetNotifyData();

            if (!notifyData.IsSet("openid") || !notifyData.IsSet("product_id")) {
                let res = new WxPayData();
                res.SetValue("return_code", "FAIL");
                res.SetValue("return_msg", "回调数据异常");
                console.error("The data WeChat post is error : " + res.ToXml());
                this.response.send(res.ToXml());
                return;
            }

            //调统一下单接口，获得下单结果
            let openid = notifyData.GetValue("openid").toString(),
                product_id = notifyData.GetValue("product_id").toString(),
                unifiedOrderResult = new WxPayData();

            try {
                unifiedOrderResult = await this.UnifiedOrder(openid, product_id);

            } catch (error) {
                console.error(error);
                let res = new WxPayData();
                res.SetValue("return_code", "FAIL");
                res.SetValue("return_msg", "统一下单失败");
                console.error("统一下单 failure : " + res.ToXml());
                this.response.send(res.ToXml());
                return;
            }

            //若下单失败，则立即返回结果给微信支付后台
            if (!unifiedOrderResult.IsSet("appid") || !unifiedOrderResult.IsSet("mch_id") || !unifiedOrderResult.IsSet("prepay_id")) {
                let res = new WxPayData();
                res.SetValue("return_code", "FAIL");
                res.SetValue("return_msg", "统一下单失败");
                console.log("统一下单 failure : " + res.ToXml());
                this.response.send(res.ToXml());
                return;
            }


            //统一下单成功,则返回成功结果给微信支付后台
            let data = new WxPayData();
            data.SetValue("return_code", "SUCCESS");
            data.SetValue("return_msg", "OK");
            data.SetValue("appid", config.GetAppID());
            data.SetValue("mch_id", config.GetMchID());
            data.SetValue("nonce_str", WxPayApi.GenerateNonceStr());
            data.SetValue("prepay_id", unifiedOrderResult.GetValue("prepay_id"));
            data.SetValue("result_code", "SUCCESS");
            data.SetValue("err_code_des", "OK");
            data.SetValue("sign", data.MakeSign());

            console.log("UnifiedOrder success , send data to WeChat : " + data.ToXml());
            this.response.send(data.ToXml());
            return;

        }

        private async  UnifiedOrder(openId: string, productId: string): Promise<cPay.WxPayData> {
            let product=this.SelectProductInfo(productId);
            //统一下单
            let req = new WxPayData();
            req.SetValue("body", product.body);
            req.SetValue("attach", product.attach);
            req.SetValue("out_trade_no", WxPayApi.GenerateOutTradeNo());
            req.SetValue("total_fee", product.total_fee);
            req.SetValue("time_start", format(new Date(), "yyyyMMddHHmmss"));
            req.SetValue("time_expire", format(new Date(), "yyyyMMddHHmmss"));
            req.SetValue("goods_tag", product.goods_tag);
            req.SetValue("trade_type", Constant.WEIXIN_trade_type_NATIVE);
            req.SetValue("openid", openId);
            req.SetValue("product_id", productId);
            let result = await WxPayApi.UnifiedOrder(req);
            return result;
        }

        private SelectProductInfo(productid: string): cPay_Model.Product {

            let product = new cPay_Model.Product();
            product.attach = "test";
            product.body="test";
            product.detail="test";
            product.goods_tag="test";
            product.total_fee=88;
            return product;

        }

    }
}