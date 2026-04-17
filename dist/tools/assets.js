import { z } from 'zod';
import { huduClient, paginateAll } from '../client.js';
export function registerAssetTools(server) {
    server.tool('list_assets', 'List assets in Hudu, optionally filtered by company or asset layout/template.', {
        page: z.number().int().min(1).default(1),
        company_id: z.number().int().optional().describe('Filter to a specific company'),
        asset_layout_id: z.number().int().optional().describe('Filter to a specific asset layout/type'),
    }, async ({ page, company_id, asset_layout_id }) => {
        try {
            const params = { page };
            if (company_id)
                params.company_id = company_id;
            if (asset_layout_id)
                params.asset_layout_id = asset_layout_id;
            const { data } = await huduClient.get('/assets', { params });
            return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return {
                content: [{ type: 'text', text: `Error: ${e instanceof Error ? e.message : String(e)}` }],
                isError: true,
            };
        }
    });
    server.tool('get_asset', 'Get full details for a specific Hudu asset by its numeric ID.', {
        asset_id: z.number().int().describe('Hudu asset ID'),
    }, async ({ asset_id }) => {
        try {
            const { data } = await huduClient.get(`/assets/${asset_id}`);
            return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return {
                content: [{ type: 'text', text: `Error: ${e instanceof Error ? e.message : String(e)}` }],
                isError: true,
            };
        }
    });
    server.tool('create_asset', 'Create a new asset record in Hudu under a specific company and asset layout.', {
        company_id: z.number().int().describe('Hudu company ID to create the asset under'),
        asset_layout_id: z.number().int().describe('Asset layout/template ID that defines the fields'),
        name: z.string().describe('Asset name/identifier'),
        custom_fields: z
            .record(z.unknown())
            .optional()
            .describe('Layout-specific custom field values as key-value pairs'),
    }, async ({ company_id, asset_layout_id, name, custom_fields }) => {
        try {
            const payload = {
                asset: { company_id, asset_layout_id, name, ...(custom_fields ?? {}) },
            };
            const { data } = await huduClient.post('/assets', payload);
            return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return {
                content: [{ type: 'text', text: `Error: ${e instanceof Error ? e.message : String(e)}` }],
                isError: true,
            };
        }
    });
    server.tool('update_asset', 'Update an existing Hudu asset. Only provide fields you want to change.', {
        asset_id: z.number().int().describe('Hudu asset ID to update'),
        name: z.string().optional().describe('New asset name'),
        custom_fields: z
            .record(z.unknown())
            .optional()
            .describe('Custom field values to update'),
    }, async ({ asset_id, name, custom_fields }) => {
        try {
            const body = {};
            if (name)
                body.name = name;
            if (custom_fields)
                Object.assign(body, custom_fields);
            const { data } = await huduClient.put(`/assets/${asset_id}`, { asset: body });
            return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return {
                content: [{ type: 'text', text: `Error: ${e instanceof Error ? e.message : String(e)}` }],
                isError: true,
            };
        }
    });
    server.tool('search_assets', 'Search Hudu assets by name across all pages. Optionally scope to a specific company.', {
        query: z.string().min(2).describe('Asset name to search for (partial match)'),
        company_id: z.number().int().optional().describe('Limit search to a specific company'),
    }, async ({ query, company_id }) => {
        try {
            const params = { name: query };
            if (company_id)
                params.company_id = company_id;
            const assets = await paginateAll('/assets', 'assets', params);
            return { content: [{ type: 'text', text: JSON.stringify(assets, null, 2) }] };
        }
        catch (e) {
            return {
                content: [{ type: 'text', text: `Error: ${e instanceof Error ? e.message : String(e)}` }],
                isError: true,
            };
        }
    });
}
//# sourceMappingURL=assets.js.map