import { IReq } from "./IReq";
import { IHttpClientCache } from "./IHttpClientCache";
export interface IHttpRequestContext {
    request: IReq;
    cache: IHttpClientCache;
    xhr: XMLHttpRequest;
    finish<T>(val: T): void;
    cancel(): void;
}
