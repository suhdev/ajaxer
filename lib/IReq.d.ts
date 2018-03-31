import { IHttpRequestConfig } from "./IHttpRequestConfig";
import { ResponseTransform } from ".";
export declare type IReqContentType = {
    text(): IReq;
    json(): IReq;
    xml(): IReq;
    urlencoded(): IReq;
    set(ct: string): IReq;
};
export declare type IReqMethod = {
    get(): IReq;
    post(): IReq;
    delete(): IReq;
    patch(): IReq;
    put(): IReq;
};
export declare type IReqCredentials = {
    include(): IReq;
    set(username: string, pwd: string): IReq;
};
export declare type IReqBody = {
    param(name: string, val: any): IReqBody;
    text(val: string): IReqBody;
    json(val: any): IReqBody;
    back(): IReq;
};
export interface IReq {
    body: IReqBody;
    credentials: IReqCredentials;
    url(url: string): IReq;
    fromHttpRequestConfig(cfg: IHttpRequestConfig): IReq;
    contentType: IReqContentType;
    accept: IReqContentType;
    method: IReqMethod;
    timeout(time: number): IReq;
    retries(num: number): IReq;
    finish<V>(val: V): IReq;
    execute<T>(handler?: (req: IReq) => void): Promise<T>;
    transformRequest(cb: (xhr: XMLHttpRequest) => void): IReq;
    transformResponse(cb: ResponseTransform): IReq;
    retry<T>(handler?: (req: IReq) => void): Promise<T>;
    cancel(): void;
}
