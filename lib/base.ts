import * as  cPay_Model from './Model';

export class BaseRequest {

    protected request: any;
    protected response: any;
    protected next: any;
    constructor(request: any, response: any, next: any) {
        this.request = request;
        this.response = response;
        this.next = next;
    }

}

export interface IBaseWeixinInfo {
    WeixinUserInfo: cPay_Model.WeixinUserInfo;
}