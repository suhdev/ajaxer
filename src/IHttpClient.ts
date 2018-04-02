import { IHttpContext } from './IHttpContext';
import { IHttpRequestConfig } from './IHttpRequestConfig';

export interface IResponseFilter {
    <Input,Output>(xhr:XMLHttpRequest,val:Input):Output
}
export interface IRequestFilter {
    (ctx:IHttpContext,next:()=>void,done:(v:any)=>void);
}

export type IResponsePipeline = IResponseFilter[]; 
export type IRequestPipeline = IRequestFilter[]; 

export interface IHttpClient {
    timeout:number; 
    responsePipeline:IResponsePipeline; 
    requestPipeline:IRequestPipeline; 

    get<T>(url:string):Promise<T>;
    get<T>(cfg:IHttpRequestConfig):Promise<T>;
    put<T>(url:string,body?:any):Promise<T>;
    put<T>(cfg:IHttpRequestConfig):Promise<T>;
    post<T>(url:string,body?:any):Promise<T>;
    post<T>(cfg:IHttpRequestConfig):Promise<T>;
    delete<T>(url:string,body?:any):Promise<T>;
    delete<T>(cfg:IHttpRequestConfig):Promise<T>;
    patch<T>(url:string,body?:any);
    patch<T>(cfg:IHttpRequestConfig):Promise<T>;
    request<T>(cfg:IHttpRequestConfig):Promise<T>;
}