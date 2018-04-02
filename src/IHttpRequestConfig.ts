import { Dictionary } from "./util";
import { IReq } from "./IReq";

export interface IHttpRequestConfig {
    method?:'get'|'post'|'patch'|'delete'|'put'; 
    url:string; 
    cache?:boolean; 
    headers?:Dictionary<string>; 
    cacheExpiryTimestamp?:number; 
    withCredentials?:boolean; 
    timeout?:number; 
    credentials?:{
        username:string;
        password:string; 
    }; 
    body?:any; 
    handler?:(req:IReq)=>void; 
}