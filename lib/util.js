"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createQuerySring(body) {
    var str = [];
    for (var k in body) {
        if (body.hasOwnProperty(k)) {
            str.push(k + "=" + body[k]);
        }
    }
    return str.join('&');
}
exports.createQuerySring = createQuerySring;
function getXhrBody(content, contentType) {
    if (contentType === void 0) { contentType = 'text/plain'; }
    var ct = contentType.toLowerCase();
    if (ct.indexOf('application/json') !== -1) {
        if (typeof content !== "undefined") {
            return JSON.stringify(content);
        }
        return null;
    }
    else if (ct.indexOf('application/x-www-form-urlencoded') !== -1) {
        var str = '';
        if (typeof content === "object") {
            return createQuerySring(content);
        }
    }
    return content;
}
exports.getXhrBody = getXhrBody;
function getXhrResponseBody(xhr, respPipeline) {
    var contentType = xhr.getResponseHeader('content-type');
    var resp = null;
    if (contentType) {
        contentType = contentType.toLowerCase();
        if (contentType.indexOf('application/json') !== -1) {
            resp = JSON.parse(xhr.responseText);
        }
        else if (contentType.indexOf('application/xml') !== -1) {
            var xmlDoc = typeof xhr.responseXML !== "undefined" && xhr.responseXML;
            if (xmlDoc) {
                return xmlDoc;
            }
            var parser = new DOMParser();
            xmlDoc = parser.parseFromString(xhr.responseText, "xml/application");
            return xmlDoc;
        }
        else {
            resp = xhr.responseText;
        }
    }
    return respPipeline.reduce(function (prev, curr) {
        return curr(xhr, prev);
    }, resp);
}
exports.getXhrResponseBody = getXhrResponseBody;
