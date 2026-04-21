import axios from 'axios';
import https from 'https';
function buildHttpsAgent() {
    if (process.env.HUDU_IGNORE_TLS_ERRORS === 'true') {
        return new https.Agent({ rejectUnauthorized: false });
    }
    return undefined;
}
// Hudu rate limit: 300 requests/min. We use 290 to leave a 10 req/min buffer.
// The token bucket enforces a minimum interval between OUTBOUND requests to Hudu.
// This is separate from the inbound limiter that guards the MCP endpoints.
const RATE_LIMIT_PER_MIN = 290;
const MIN_INTERVAL_MS = Math.ceil(60_000 / RATE_LIMIT_PER_MIN); // ~207ms
let lastRequestTime = 0;
async function enforceRateLimit() {
    const now = Date.now();
    const wait = MIN_INTERVAL_MS - (now - lastRequestTime);
    if (wait > 0)
        await new Promise((r) => setTimeout(r, wait));
    lastRequestTime = Date.now();
}
export function createHuduClient() {
    const headers = {
        'x-api-key': process.env.HUDU_API_KEY,
        'Content-Type': 'application/json',
    };
    // Cloudflare Access Service Token — required when Hudu is behind Cloudflare Zero Trust
    if (process.env.CF_ACCESS_CLIENT_ID && process.env.CF_ACCESS_CLIENT_SECRET) {
        headers['CF-Access-Client-Id'] = process.env.CF_ACCESS_CLIENT_ID;
        headers['CF-Access-Client-Secret'] = process.env.CF_ACCESS_CLIENT_SECRET;
    }
    const client = axios.create({
        baseURL: process.env.HUDU_BASE_URL,
        headers,
        httpsAgent: buildHttpsAgent(),
    });
    client.interceptors.request.use(async (config) => {
        await enforceRateLimit();
        return config;
    });
    return client;
}
export const huduClient = createHuduClient();
/**
 * Fetches all pages for a paginated Hudu endpoint and returns a flat array.
 * Hudu signals end-of-data by returning an empty array for the current page.
 *
 * @param path     API path, e.g. '/companies'
 * @param dataKey  Top-level key in the response body, e.g. 'companies'
 * @param params   Additional query parameters to include on every request
 */
export async function paginateAll(path, dataKey, params = {}) {
    const results = [];
    let page = 1;
    while (true) {
        const { data } = await huduClient.get(path, { params: { ...params, page } });
        const items = (data[dataKey] ?? []);
        results.push(...items);
        if (items.length === 0)
            break;
        page++;
    }
    return results;
}
//# sourceMappingURL=client.js.map