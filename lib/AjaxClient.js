"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var AjaxClient = (function () {
    function AjaxClient() {
        this._cache = createHttpCache();
        this._requestPipeline = [];
        this._responsePipeline = [];
        this.timeout = 25000;
    }
    Object.defineProperty(AjaxClient.prototype, "responsePipeline", {
        get: function () {
            return this._responsePipeline;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AjaxClient.prototype, "requestPipeline", {
        get: function () {
            return this._requestPipeline;
        },
        enumerable: true,
        configurable: true
    });
    AjaxClient.prototype.get = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length === 0) {
            throw new Error("Invalid argument, expected object or string but got undefined");
        }
        if (args.length === 1) {
            if (typeof args[0] === "string") {
                return this.request({
                    url: args[0],
                    method: 'get',
                });
            }
            else if (typeof args[0] === "object") {
                return this.request(__assign({}, args[0], { method: 'get' }));
            }
            else {
                throw new Error("Invalid argument, expected object or string but got " + typeof args[0]);
            }
        }
        throw new Error("Invalid argument, expected single argument but got " + args.length);
    };
    AjaxClient.prototype.put = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length === 0) {
            throw new Error("Invalid argument, expected object or string but got undefined");
        }
        if (typeof args[0] === "string") {
            return this.request({
                url: args[0],
                method: 'put',
                body: args[1]
            });
        }
        else if (typeof args[0] === "object") {
            return this.request(__assign({}, args[0], { method: 'put' }));
        }
        else {
            throw new Error("Invalid argument, expected object or string but got " + typeof args[0]);
        }
    };
    AjaxClient.prototype.post = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length === 0) {
            throw new Error("Invalid argument, expected object or string but got undefined");
        }
        if (typeof args[0] === "string") {
            return this.request({
                url: args[0],
                method: 'post',
                body: args[1]
            });
        }
        else if (typeof args[0] === "object") {
            return this.request(__assign({}, args[0], { method: 'post' }));
        }
        else {
            throw new Error("Invalid argument, expected object or string but got " + typeof args[0]);
        }
    };
    AjaxClient.prototype.delete = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length === 0) {
            throw new Error("Invalid argument, expected object or string but got undefined");
        }
        if (typeof args[0] === "string") {
            return this.request({
                url: args[0],
                method: 'delete',
                body: args[1]
            });
        }
        else if (typeof args[0] === "object") {
            return this.request(__assign({}, args[0], { method: 'delete' }));
        }
        else {
            throw new Error("Invalid argument, expected object or string but got " + typeof args[0]);
        }
    };
    AjaxClient.prototype.patch = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length === 0) {
            throw new Error("Invalid argument, expected object or string but got undefined");
        }
        if (typeof args[0] === "string") {
            return this.request({
                url: args[0],
                method: 'patch',
                body: args[1]
            });
        }
        else if (typeof args[0] === "object") {
            return this.request(__assign({}, args[0], { method: 'patch' }));
        }
        else {
            throw new Error("Invalid argument, expected object or string but got " + typeof args[0]);
        }
    };
    AjaxClient.prototype.request = function (cfg) {
        var ctx = createHttpContext(this._cache);
        var req = this.requestPipeline;
        var resp = this.responsePipeline;
        ctx.request.fromHttpRequestConfig(cfg);
        return new Promise(function (res, rej) {
            var stop = false;
            function next() {
                if (stop) {
                    return;
                }
                var start = req.shift();
                if (start) {
                    start(ctx, next, done);
                }
                else {
                    ctx.request.transformResponse(function (xhr, input) {
                        return resp.reduce(function (prev, curr) {
                            return curr(xhr, prev);
                        }, input);
                    });
                    res(ctx.request.execute(cfg.handler));
                }
            }
            function done(v) {
                stop = true;
                res(v);
            }
            next();
        });
    };
    return AjaxClient;
}());
exports.AjaxClient = AjaxClient;
function createHttpCache(defaultExpiryPeriod) {
    if (defaultExpiryPeriod === void 0) { defaultExpiryPeriod = 300000; }
    var _cache = {};
    return {
        get: function (key) {
            var item = _cache[key];
            return new Promise(function (res, rej) {
                if (item && (item.expiryTimestamp > Date.now())) {
                    res(item.value);
                    return;
                }
                rej();
            });
        },
        set: function (key, value, expiryTimestamp) {
            _cache[key] = {
                value: value,
                expiryTimestamp: expiryTimestamp || (Date.now() + defaultExpiryPeriod),
                key: key
            };
            return new Promise(function (r) { return r(); });
        }
    };
}
exports.createHttpCache = createHttpCache;
function createHttpContext(cache) {
    var req = createHttpRequest();
    return {
        get request() {
            return req;
        },
        get cache() {
            return cache;
        },
        finish: function (val) {
            req.finish(val);
        }
    };
}
exports.createHttpContext = createHttpContext;
function createHttpRequest() {
    var xhr = new XMLHttpRequest();
    var _url = '';
    var _method = 'get';
    var _timeout = 20 * 1000;
    var _retryCount = 0;
    var _retries = 1;
    var _body = {};
    var _headers = {};
    var _withCredentials = false;
    var _finishedOutput;
    var _username = undefined;
    var _password = undefined;
    var _cancelled = false;
    var respPipeline = [];
    function setContentType(ct) {
        setHeader('content-type', ct);
    }
    function setAccept(ct) {
        setHeader('accept', ct);
    }
    function setHeader(name, val) {
        _headers[name.toLowerCase()] = val;
    }
    function updateHeaders() {
        for (var key in _headers) {
            if (_headers.hasOwnProperty(key)) {
                xhr.setRequestHeader(key, _headers[key]);
            }
        }
    }
    function createContentTypeHeader(hname) {
        return {
            text: function () {
                setHeader(hname, 'text/plain');
                return o;
            },
            json: function () {
                setHeader(hname, 'application/json');
                return o;
            },
            xml: function () {
                setHeader(hname, 'application/xml');
                return o;
            },
            urlencoded: function () {
                setHeader(hname, 'application/x-www-form-urlencoded');
                return o;
            },
            set: function (ct) {
                setHeader(hname, ct);
                return o;
            }
        };
    }
    var b = {
        param: function (name, val) {
            _body = _body || {};
            _body[name] = val;
            return b;
        },
        text: function (val) {
            _body = val;
            return b;
        },
        json: function (val) {
            _body = JSON.stringify(val);
            return b;
        },
        back: function () {
            return o;
        }
    };
    var m = {
        get: function () {
            _method = 'get';
            return o;
        },
        post: function () {
            _method = 'post';
            return o;
        },
        put: function () {
            _method = 'put';
            return o;
        },
        delete: function () {
            _method = 'delete';
            return o;
        },
        patch: function () {
            _method = 'patch';
            return o;
        }
    };
    var ct = createContentTypeHeader('content-type');
    var a = createContentTypeHeader('accept');
    var c = {
        include: function () {
            _withCredentials = true;
            return o;
        },
        set: function (user, pwd) {
            _username = user;
            _password = pwd;
            return o;
        }
    };
    var o = {
        fromHttpRequestConfig: function (_a) {
            var url = _a.url, method = _a.method, headers = _a.headers, withCredentials = _a.withCredentials, timeout = _a.timeout, credentials = _a.credentials;
            _url = url;
            _method = method || 'get';
            _timeout = timeout || _timeout || 25000;
            if (headers && typeof headers === "object") {
                for (var k in headers) {
                    setHeader(k, headers[k]);
                }
            }
            if (typeof withCredentials === "boolean") {
                _withCredentials = withCredentials;
            }
            if (typeof credentials === "object") {
                _username = credentials.username;
                _password = credentials.password;
            }
            return o;
        },
        get credentials() {
            return c;
        },
        url: function (url) {
            _url = url;
            return o;
        },
        get method() {
            return m;
        },
        retries: function (num) {
            _retries = num;
            return o;
        },
        transformRequest: function (cb) {
            cb(xhr);
            return o;
        },
        transformResponse: function (cb) {
            respPipeline.push(cb);
            return o;
        },
        retry: function (handler) {
            xhr = new XMLHttpRequest();
            _cancelled = false;
            return o.execute(handler);
        },
        finish: function (val) {
            _finishedOutput = val;
            return o;
        },
        execute: function (handler) {
            if (typeof _finishedOutput !== "undefined") {
                return new Promise(function (r) { return r(_finishedOutput); });
            }
            if (_cancelled) {
                return new Promise(function (res, rej) { rej(new Error('Cancelled')); });
            }
            try {
                handler && handler(o);
            }
            catch (err) {
                console.error(err.message);
            }
            return new Promise(function (res, rej) {
                if (_cancelled) {
                    rej(new Error('Cancelled'));
                    return;
                }
                xhr.open(_method, _url, true, _username, _password);
                xhr.withCredentials = _withCredentials;
                updateHeaders();
                xhr.timeout = _timeout;
                xhr.onabort = function () {
                    rej();
                };
                xhr.onerror = function (err) {
                    rej(err.error);
                };
                xhr.onreadystatechange = function (e) {
                    if (_cancelled) {
                        rej(new Error('Cancelled'));
                        return;
                    }
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status === 200) {
                            res(util_1.getXhrResponseBody(xhr, respPipeline));
                        }
                        else if (xhr.status >= 400) {
                            rej(xhr.responseText);
                        }
                    }
                };
                xhr.send(util_1.getXhrBody(_body, _headers['content-type'] || 'application/json'));
            })
                .then(function (r) { return r; }, function (err) {
                if (_retryCount > 0) {
                    _retryCount--;
                    return o.execute(handler);
                }
                throw err;
            })
                .then(function (v) {
                _retryCount = _retries;
                return v;
            }, function (err) {
                _retryCount = _retries;
                throw err;
            });
        },
        get body() {
            return b;
        },
        get contentType() {
            return ct;
        },
        get accept() {
            return a;
        },
        timeout: function (miliseconds) {
            if (miliseconds === void 0) { miliseconds = 5; }
            _timeout = miliseconds;
            return o;
        },
        cancel: function () {
            _cancelled = true;
            if (xhr.readyState !== XMLHttpRequest.UNSENT) {
                xhr.abort();
            }
        }
    };
    return o;
}
exports.createHttpRequest = createHttpRequest;
