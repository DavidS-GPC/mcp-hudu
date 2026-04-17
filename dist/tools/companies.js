import { z } from 'zod';
import { huduClient, paginateAll } from '../client.js';
export function registerCompanyTools(server) {
    server.tool('list_companies', 'List companies in Hudu IT documentation. Paginated. Use search_companies for name-based search across all pages.', {
        page: z.number().int().min(1).default(1),
        page_size: z.number().int().min(1).max(100).default(25),
        name: z.string().optional().describe('Filter by company name (partial match)'),
    }, async ({ page, page_size, name }) => {
        try {
            const params = { page, page_size };
            if (name)
                params.name = name;
            const { data } = await huduClient.get('/companies', { params });
            return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return {
                content: [{ type: 'text', text: `Error: ${e instanceof Error ? e.message : String(e)}` }],
                isError: true,
            };
        }
    });
    server.tool('get_company', 'Get full details for a specific Hudu company by its numeric ID.', {
        company_id: z.number().int().describe('Hudu company ID'),
    }, async ({ company_id }) => {
        try {
            const { data } = await huduClient.get(`/companies/${company_id}`);
            return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return {
                content: [{ type: 'text', text: `Error: ${e instanceof Error ? e.message : String(e)}` }],
                isError: true,
            };
        }
    });
    server.tool('search_companies', 'Search all Hudu companies by name. Automatically fetches all matching pages.', {
        query: z.string().min(2).describe('Company name to search for (partial match)'),
    }, async ({ query }) => {
        try {
            const companies = await paginateAll('/companies', 'companies', { name: query });
            return { content: [{ type: 'text', text: JSON.stringify(companies, null, 2) }] };
        }
        catch (e) {
            return {
                content: [{ type: 'text', text: `Error: ${e instanceof Error ? e.message : String(e)}` }],
                isError: true,
            };
        }
    });
}
//# sourceMappingURL=companies.js.map