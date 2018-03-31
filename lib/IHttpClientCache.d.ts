export interface IHttpClientCache {
    get<T>(key: string): Promise<T>;
    set<T>(key: string, val: T): Promise<void>;
}
