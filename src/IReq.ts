import { IHttpRequestConfig } from "./IHttpRequestConfig";
import { ResponseTransform } from "./AjaxClient";

export type IReqContentType = {
    text():IReq;
    json():IReq;
    xml():IReq;
    urlencoded():IReq; 
    set(ct:string):IReq;
}

export type IReqMethod = {
    get():IReq;
    post():IReq; 
    delete():IReq;
    patch():IReq; 
    put():IReq; 
}

export type IReqCredentials = {
    include():IReq;
    set(username:string,pwd:string):IReq; 
}

export type IReqBody = {
    param(name:string,val:any):IReqBody; 
    text(val:string):IReqBody; 
    json(val:any):IReqBody; 
    back():IReq; 
}

export interface IReq {
    body:IReqBody; 
    credentials:IReqCredentials;
    url(url:string):IReq; 
    fromHttpRequestConfig(cfg:IHttpRequestConfig):IReq; 
    contentType:IReqContentType; 
    accept:IReqContentType; 
    method:IReqMethod; 
    timeout(time:number):IReq; 
    retries(num:number):IReq; 
    finish<V>(val:V):IReq;
    execute<T>(handler?:(req:IReq)=>void):Promise<T>; 
    transformRequest(cb:(xhr:XMLHttpRequest)=>void):IReq; 
    transformResponse(cb:ResponseTransform):IReq;
    retry<T>(handler?:(req:IReq)=>void):Promise<T>;
    cancel():void; 
};