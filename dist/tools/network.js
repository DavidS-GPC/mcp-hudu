import { z } from 'zod';
import { huduClient } from '../client.js';
export function registerNetworkTools(server) {
    server.tool('list_expirations', 'List expiring items tracked in Hudu — SSL certificates, domains, warranties, contracts. Essential for proactive MSP monitoring.', {
        page: z.number().int().min(1).default(1),
        company_id: z.number().int().optional().describe('Filter to a specific company'),
        expiration_type: z.string().optional().describe('Filter by type, e.g. "ssl", "domain", "warranty"'),
        days_until_expiry: z.number().int().optional().describe('Only return items expiring within this many days'),
    }, async ({ page, company_id, expiration_type, days_until_expiry }) => {
        try {
            const params = { page };
            if (company_id) params.company_id = company_id;
            if (expiration_type) params.expiration_type = expiration_type;
            if (days_until_expiry) params.days_until_expiry = days_until_expiry;
            const { data } = await huduClient.get('/expirations', { params });
            return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: 'text', text: `Error: ${e instanceof Error ? e.message : String(e)}` }], isError: true };
        }
    });
    server.tool('list_networks', 'List IP networks documented in Hudu for a company.', {
        page: z.number().int().min(1).default(1),
        company_id: z.number().int().optional().describe('Filter to a specific company'),
        search: z.string().optional().describe('Filter by network name or address'),
    }, async ({ page, company_id, search }) => {
        try {
            const params = { page };
            if (company_id) params.company_id = company_id;
            if (search) params.search = search;
            const { data } = await huduClient.get('/networks', { params });
            return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: 'text', text: `Error: ${e instanceof Error ? e.message : String(e)}` }], isError: true };
        }
    });
    server.tool('get_network', 'Get full details of a specific Hudu network by its ID, including all documented subnets.', {
        network_id: z.number().int().describe('Hudu network ID'),
    }, async ({ network_id }) => {
        try {
            const { data } = await huduClient.get(`/networks/${network_id}`);
            return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: 'text', text: `Error: ${e instanceof Error ? e.message : String(e)}` }], isError: true };
        }
    });
    server.tool('list_ip_addresses', 'List IP addresses documented within a Hudu network.', {
        page: z.number().int().min(1).default(1),
        network_id: z.number().int().optional().describe('Filter to a specific network'),
        company_id: z.number().int().optional().describe('Filter to a specific company'),
        search: z.string().optional().describe('Filter by IP address or hostname'),
    }, async ({ page, network_id, company_id, search }) => {
        try {
            const params = { page };
            if (network_id) params.network_id = network_id;
            if (company_id) params.company_id = company_id;
            if (search) params.search = search;
            const { data } = await huduClient.get('/ip_addresses', { params });
            return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: 'text', text: `Error: ${e instanceof Error ? e.message : String(e)}` }], isError: true };
        }
    });
    server.tool('list_procedures', 'List procedures (checklists / runbooks) in Hudu. Filter by company to find client-specific runbooks.', {
        page: z.number().int().min(1).default(1),
        company_id: z.number().int().optional().describe('Filter to a specific company'),
        search: z.string().optional().describe('Filter by procedure name'),
    }, async ({ page, company_id, search }) => {
        try {
            const params = { page };
            if (company_id) params.company_id = company_id;
            if (search) params.search = search;
            const { data } = await huduClient.get('/procedures', { params });
            return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: 'text', text: `Error: ${e instanceof Error ? e.message : String(e)}` }], isError: true };
        }
    });
    server.tool('get_procedure', 'Get full details and steps for a specific Hudu procedure/runbook by its ID.', {
        procedure_id: z.number().int().describe('Hudu procedure ID'),
    }, async ({ procedure_id }) => {
        try {
            const { data } = await huduClient.get(`/procedures/${procedure_id}`);
            return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: 'text', text: `Error: ${e instanceof Error ? e.message : String(e)}` }], isError: true };
        }
    });
}
//# sourceMappingURL=network.js.map
