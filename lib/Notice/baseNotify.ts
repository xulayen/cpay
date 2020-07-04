
/**
 * 基类，处理请求
 */
export default class BaseNotify {
    protected request: any;
    protected response: any;
    protected next: any;
    constructor(request: any, response: any, next: any) {
        this.request = request;
        this.response = response;
        this.next = next;
    }
}