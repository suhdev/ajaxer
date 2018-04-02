import { IResponsePipeline, IRequestPipeline, IHttpClient } from "./IHttpClient";
import { IHttpClientCache } from "./IHttpClientCache";
import { IHttpRequestConfig } from "./IHttpRequestConfig";
import { IReq } from './IReq';
export declare class AjaxClient implements IHttpClient {
    _responsePipeline: IResponsePipeline;
    _requestPipeline: IRequestPipeline;
    _cache: IHttpClientCache;
    timeout: number;
    constructor();
    readonly responsePipeline: IResponsePipeline;
    readonly requestPipeline: IRequestPipeline;
    get<T>(url: string): Promise<T>;
    get<T>(cfg: IHttpRequestConfig): Promise<T>;
    put<T>(url: string, body?: any): Promise<T>;
    put<T>(cfg: IHttpRequestConfig): Promise<T>;
    post<T>(url: string, body?: any): Promise<T>;
    post<T>(cfg: IHttpRequestConfig): Promise<T>;
    delete<T>(url: string, body?: any): Promise<T>;
    delete<T>(cfg: IHttpRequestConfig): Promise<T>;
    patch<T>(url: string, body?: any): Promise<T>;
    patch<T>(cfg: IHttpRequestConfig): Promise<T>;
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
