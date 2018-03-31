import { IResponsePipeline, IRequestPipeline } from "./IHttpClient";
import { IHttpClientCache } from "./IHttpClientCache";
import { IHttpRequestConfig } from "./IHttpRequestConfig";
import { Dictionary, getXhrResponseBody, getXhrBody } from './util';
import { IReq, IReqCredentials } from './IReq';


export class AjaxClient {
    _responsePipeline:IResponsePipeline; 
    _requestPipeline:IRequestPipeline; 
    _cache:IHttpClientCache; 
    constructor(){
        this._cache = createHttpCache(); 
        this._requestPipeline = []; 
        this._responsePipeline = []; 
    }

    get responsePipeline():IResponsePipeline{
        return this._responsePipeline; 
    }

    get requestPipeline():IRequestPipeline{
        return this._requestPipeline; 
    }

    get(url:string);
    get(cfg:IHttpRequestConfig);
    get(...args:any[]){
        if (args.length === 0){
            throw new Error(`Invalid argument, expected object or string but got undefined`); 
        }
        if (args.length === 1){
            if (typeof args[0] === "string"){
                return this.request({
                    url:args[0], 
                    method:'get',
                });
            }else if (typeof args[0] === "object"){
                return this.request({...args[0],method:'get'});
            }else {
                throw new Error(`Invalid argument, expected object or string but got ${typeof args[0]}`);
            }
        }
        throw new Error(`Invalid argument, expected single argument but got ${args.length}`);
    }

    put(url:string,body?:any);
    put(cfg:IHttpRequestConfig);
    put(...args:any[]){
        if (args.length === 0){
            throw new Error(`Invalid argument, expected object or string but got undefined`); 
        }
        if (typeof args[0] === "string"){
            return this.request({
                url:args[0], 
                method:'put',
                body:args[1] 
            });
        }else if (typeof args[0] === "object"){
            return this.request({...args[0],method:'put'});
        }else {
            throw new Error(`Invalid argument, expected object or string but got ${typeof args[0]}`);
        }
    }

    post(url:string,body?:any);
    post(cfg:IHttpRequestConfig);
    post(...args:any[]){
        if (args.length === 0){
            throw new Error(`Invalid argument, expected object or string but got undefined`); 
        }
        if (typeof args[0] === "string"){
            return this.request({
                url:args[0], 
                method:'post',
                body:args[1] 
            });
        }else if (typeof args[0] === "object"){
            return this.request({...args[0],method:'post'});
        }else {
            throw new Error(`Invalid argument, expected object or string but got ${typeof args[0]}`);
        }
    }

    delete(url:string,body?:any);
    delete(cfg:IHttpRequestConfig);
    delete(...args:any[]){
        if (args.length === 0){
            throw new Error(`Invalid argument, expected object or string but got undefined`); 
        }
        if (typeof args[0] === "string"){
            return this.request({
                url:args[0], 
                method:'delete',
                body:args[1] 
            });
        }else if (typeof args[0] === "object"){
            return this.request({...args[0],method:'delete'});
        }else {
            throw new Error(`Invalid argument, expected object or string but got ${typeof args[0]}`);
        }
    }

    patch(url:string,body?:any);
    patch(cfg:IHttpRequestConfig);
    patch(...args:any[]){
        if (args.length === 0){
            throw new Error(`Invalid argument, expected object or string but got undefined`); 
        }
        if (typeof args[0] === "string"){
            return this.request({
                url:args[0], 
                method:'patch',
                body:args[1] 
            });
        }else if (typeof args[0] === "object"){
            return this.request({...args[0],method:'patch'});
        }else {
            throw new Error(`Invalid argument, expected object or string but got ${typeof args[0]}`);
        }
    }

    request<T>(cfg:IHttpRequestConfig){
        var ctx = createHttpContext(this._cache);
        var req = this.requestPipeline;
        var resp = this.responsePipeline; 
        ctx.request.fromHttpRequestConfig(cfg); 
        return new Promise<T>((res,rej)=>{
            var stop = false; 
            function next(){
                if (stop){
                    return; 
                }
                var start = req.shift();
                if (start){
                    start(ctx,next,done); 
                }else{
                    ctx.request.transformResponse((xhr,input)=>{
                        return resp.reduce((prev,curr)=>{
                            return curr<any,any>(xhr,prev); 
                        },input); 
                    });
                    res(ctx.request.execute(cfg.handler)); 
                }
            }

            function done(v:T){
                stop = true; 
                res(v); 
            }

            next();
        });
    }
}

export interface ICacheItem<T> {
    key:string; 
    expiryTimestamp:number; 
    value:T;
}

export function createHttpCache(defaultExpiryPeriod:number = 300000):IHttpClientCache{
    var _cache:Dictionary<ICacheItem<any>> = {};

    return {
        get<T>(key:string){
            var item = _cache[key]; 
            return new Promise<T>((res,rej)=>{
                if (item && (item.expiryTimestamp > Date.now())){
                    res(item.value); 
                    return; 
                }
                rej(); 
            })
        },
        set<T>(key:string,value:T, expiryTimestamp?:number){
            _cache[key] = {
                value,
                expiryTimestamp:expiryTimestamp||(Date.now()+defaultExpiryPeriod), 
                key
            }; 
            return new Promise<void>(r=>r()); 
        }
    };
}

export function createHttpContext(cache:IHttpClientCache){
    var req = createHttpRequest(); 

    return {
        get request(){
            return req; 
        },
        get cache(){
            return cache; 
        },
        finish<T>(val:T){
            req.finish(val); 
        }
    };
}

export type ResponseTransform = <Input,Output>(xhr:XMLHttpRequest,val:Input)=>Output; 
export function createHttpRequest(){
    var xhr = new XMLHttpRequest(); 
    var _url = ''; 
    var _method = 'get'; 
    var _timeout = 5*1000;
    var _retryCount = 0; 
    var _retries = 1; 
    var _body:any = {};  
    var _headers = {}; 
    var _withCredentials = false; 
    var _finishedOutput;
    var _username = undefined; 
    var _password = undefined; 
    var _cancelled = false; 
    var respPipeline:ResponseTransform[] = []; 

    function setContentType(ct:string){
        setHeader('content-type',ct); 
    }
    function setAccept(ct:string){
        setHeader('accept',ct); 
    }
    function setHeader(name:string,val:string){
        _headers[name.toLowerCase()] = val; 
    }
    
    function updateHeaders(){
        for(var key in _headers){
            if(_headers.hasOwnProperty(key)){
                xhr.setRequestHeader(key,_headers[key]);
            }
        }
    }

    function createContentTypeHeader(hname:string){
        return {
            text(){
                setHeader(hname,'text/plain');
                return o; 
            },
            json(){
                setHeader(hname,'application/json');
                return o; 
            },
            xml(){
                setHeader(hname,'application/xml');
                return o; 
            },
            urlencoded(){
                setHeader(hname,'application/x-www-form-urlencoded');
                return o; 
            },
            set(ct:string){
                setHeader(hname,ct);
                return o; 
            }
        }
    }

    var b = {
        param(name:string,val:any){
            _body = _body || {}; 
            _body[name] = val; 
            return b; 
        }, 
        text(val:string){
            _body = val; 
            return b; 
        },
        json(val:any){
            _body = JSON.stringify(val); 
            return b; 
        },
        back(){
            return o; 
        }
    }; 

    var m = {
        get(){
            _method = 'get'; 
            return o; 
        },
        post(){
            _method = 'post'; 
            return o; 
        },
        put(){
            _method = 'put'; 
            return o; 
        },
        delete(){
            _method = 'delete'; 
            return o; 
        },
        patch(){
            _method = 'patch'; 
            return o; 
        }
    }; 

    var ct = createContentTypeHeader('content-type');
    var a = createContentTypeHeader('accept'); 
    var c:IReqCredentials = {
        include(){
            _withCredentials = true; 
            return o; 
        }, 
        set(user:string,pwd:string){
            _username = user; 
            _password = pwd; 
            return o; 
        }
    };
   
    var o:IReq = {
        fromHttpRequestConfig({url,method,
            headers,withCredentials,
            credentials}:IHttpRequestConfig){
            _url = url; 
            _method = method||'get';
            if (headers && typeof headers === "object"){
                for(var k in headers){
                    setHeader(k,headers[k]); 
                }
            }
            if (typeof withCredentials === "boolean"){
                _withCredentials = withCredentials; 
            }
            if (typeof credentials === "object"){
                _username = credentials.username; 
                _password = credentials.password; 
            }

            return o; 
        },
        get credentials(){
            return c;
        },
        url(url:string){
            _url = url; 
            return o; 
        },
        get method(){
            return m; 
        },
        retries(num:number){
            _retries = num; 
            return o; 
        },
        transformRequest(cb:(xhr:XMLHttpRequest)=>void){
            cb(xhr); 
            return o; 
        },
        transformResponse(cb:ResponseTransform){
            respPipeline.push(cb); 
            return o; 
        },
        retry(handler?:(req:IReq)=>void){
            xhr = new XMLHttpRequest(); 
            _cancelled = false; 
            return o.execute(handler);
        },
        finish<V>(val:V){
            _finishedOutput = val; 
            return o; 
        },
        execute<T>(handler?:(req:IReq)=>void){
            if (typeof _finishedOutput !== "undefined"){ 
                return new Promise<T>(r=>r(_finishedOutput)); 
            }
            if (_cancelled){
                return new Promise<T>((res,rej)=>{rej(new Error('Cancelled'))}); 
            }
            try {
                handler && handler(o); 
            }catch(err){
                console.error(err.message); 
            }
            return new Promise<T>((res,rej)=>{
                if (_cancelled){
                    rej(new Error('Cancelled')); 
                    return; 
                }
                xhr.open(_method,_url,true,_username,_password); 
                xhr.withCredentials = _withCredentials; 
                updateHeaders(); 
                xhr.timeout = _timeout; 
                xhr.onabort = ()=>{
                    rej(); 
                }; 
                xhr.onerror = (err)=>{
                    rej(err.error); 
                };
                xhr.onreadystatechange = (e)=>{
                    if (_cancelled){
                        rej(new Error('Cancelled')); 
                        return; 
                    }
                    if (xhr.readyState === XMLHttpRequest.DONE){
                        if (xhr.status === 200){
                            res(getXhrResponseBody(xhr,respPipeline));
                        }else if (xhr.status >= 400){
                            rej(xhr.responseText); 
                        }
                    }
                }
                xhr.send(getXhrBody(_body,_headers['content-type']||'application/json')); 
                
            })
            .then((r)=>r,(err)=>{
                if (_retryCount > 0){
                    _retryCount--; 
                    return o.execute<T>(handler); 
                }
                throw err; 
            })
            .then((v)=>{
                _retryCount = _retries; 
                return v;
            },(err)=>{
                _retryCount = _retries; 
                throw err; 
            });
        },
        get body(){
            return b;
        },
        get contentType(){
            return ct; 
        },
        get accept(){
            return a; 
        },
        timeout(miliseconds:number=5){
            _timeout = miliseconds; 
            return o; 
        },
        cancel(){
            _cancelled = true; 
            if (xhr.readyState !== XMLHttpRequest.UNSENT){
                xhr.abort();
            }
        }
    }

    return o; 
}
