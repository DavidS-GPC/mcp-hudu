import { AxiosInstance } from 'axios';
export declare function createHuduClient(): AxiosInstance;
export declare const huduClient: AxiosInstance;
/**
 * Fetches all pages for a paginated Hudu endpoint and returns a flat array.
 * Hudu signals end-of-data by returning an empty array for the current page.
 *
 * @param path     API path, e.g. '/companies'
 * @param dataKey  Top-level key in the response body, e.g. 'companies'
 * @param params   Additional query parameters to include on every request
 */
export declare function paginateAll<T>(path: string, dataKey: string, params?: Record<string, unknown>): Promise<T[]>;
