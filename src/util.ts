import { ResponseTransform } from './index';
export function createQuerySring(body:object){
    var str = []; 
    for(var k in body){
        if (body.hasOwnProperty(k)){
            str.push(`${k}=${body[k]}`);
        }
    }
    return str.join('&'); 
}

export function getXhrBody(content:any,contentType:string = 'text/plain'){
    var ct = contentType.toLowerCase(); 
    if (ct.indexOf('application/json') !== -1){
        if (typeof content !== "undefined"){
            return JSON.stringify(content); 
        }
        return null; 
    }else if (ct.indexOf('application/x-www-form-urlencoded') !== -1){
        var str = ''; 
        if (typeof content === "object"){
            return createQuerySring(content); 
        }   
    }
    return content; 
}

export function getXhrResponseBody(xhr:XMLHttpRequest,respPipeline:ResponseTransform[]){
    var contentType = xhr.getResponseHeader('content-type');
    var resp:any = null; 
    if (contentType){
        contentType = contentType.toLowerCase(); 
        if (contentType.indexOf('application/json') !== -1){
            resp = JSON.stringify(xhr.responseText);
        }else if (contentType.indexOf('application/xml') !== -1){
            resp = xhr.responseXML; 
        }else {
            resp = xhr.responseText; 
        }
    }
    return respPipeline.reduce((prev,curr)=>{
        return curr(xhr,prev); 
    },resp); 
}

export interface Dictionary<T>{
    [idx:string]:T; 
}