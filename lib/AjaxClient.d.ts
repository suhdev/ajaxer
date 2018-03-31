import { IResponsePipeline, IRequestPipeline, IHttpClient } from "./IHttpClient";
import { IHttpClientCache } from "./IHttpClientCache";
import { IHttpRequestConfig } from "./IHttpRequestConfig";
import { IReq } from './IReq';
export declare class AjaxClient implements IHttpClient {
    _responsePipeline: IResponsePipeline;
    _requestPipeline: IRequestPipeline;
    _cache: IHttpClientCache;
    constructor();
    readonly responsePipeline: IResponsePipeline;
    readonly requestPipeline: IRequestPipeline;
    get(url: string): any;
    get(cfg: IHttpRequestConfig): any;
    put(url: string, body?: any): any;
    put(cfg: IHttpRequestConfig): any;
    post(url: string, body?: any): any;
    post(cfg: IHttpRequestConfig): any;
    delete(url: string, body?: any): any;
    delete(cfg: IHttpRequestConfig): any;
    patch(url: string, body?: any): any;
    patch(cfg: IHttpRequestConfig): any;
    request<T>(cfg: IHttpRequestConfig): Promise<T>;
}
export interface ICacheItem<T> {
    key: string;
    expiryTimestamp: number;
    value: T;
}
export declare function createHttpCache(defaultExpiryPeriod?: number): IHttpClientCache;
export declare function createHttpContext(cache: IHttpClientCache): {
    readonly request: IReq;
    readonly cache: IHttpClientCache;
    finish<T>(val: T): void;
};
export declare type ResponseTransform = <Input, Output>(xhr: XMLHttpRequest, val: Input) => Output;
export declare function createHttpRequest(): IReq;
