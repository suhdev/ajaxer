import { ResponseTransform } from './index';
export declare function createQuerySring(body: object): string;
export declare function getXhrBody(content: any, contentType?: string): any;
export declare function getXhrResponseBody(xhr: XMLHttpRequest, respPipeline: ResponseTransform[]): any;
export interface Dictionary<T> {
    [idx: string]: T;
}
