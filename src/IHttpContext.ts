import { IHttpClientCache } from "./IHttpClientCache";
import { IReq } from "./IReq";

export interface IHttpContext {
    request:IReq; 
    cache:IHttpClientCache; 
    finish<T>(val:T):void; 

}