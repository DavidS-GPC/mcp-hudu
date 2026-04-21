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
    server.tool('create_company', 'Create a new company in Hudu. Use this when onboarding a new client.', {
        name: z.string().describe('Company name'),
        phone: z.string().optional().describe('Main phone number'),
        website: z.string().optional().describe('Company website URL'),
        city: z.string().optional().describe('City'),
        notes: z.string().optional().describe('Internal notes about the company'),
    }, async ({ name, phone, website, city, notes }) => {
        try {
            const company = { name };
            if (phone) company.phone = phone;
            if (website) company.website = website;
            if (city) company.city = city;
            if (notes) company.notes = notes;
            const { data } = await huduClient.post('/companies', { company });
            return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: 'text', text: `Error: ${e instanceof Error ? e.message : String(e)}` }], isError: true };
        }
    });
    server.tool('update_company', 'Update an existing Hudu company. Only provide fields you want to change.', {
        company_id: z.number().int().describe('Hudu company ID to update'),
        name: z.string().optional().describe('New company name'),
        phone: z.string().optional().describe('Phone number'),
        website: z.string().optional().describe('Website URL'),
        city: z.string().optional().describe('City'),
        notes: z.string().optional().describe('Internal notes'),
    }, async ({ company_id, name, phone, website, city, notes }) => {
        try {
            const company = {};
            if (name) company.name = name;
            if (phone) company.phone = phone;
            if (website) company.website = website;
            if (city) company.city = city;
            if (notes) company.notes = notes;
            const { data } = await huduClient.put(`/companies/${company_id}`, { company });
            return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: 'text', text: `Error: ${e instanceof Error ? e.message : String(e)}` }], isError: true };
        }
    });
}
//# sourceMappingURL=companies.js.map