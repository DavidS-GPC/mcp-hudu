import { z } from 'zod';
import { huduClient } from '../client.js';
export function registerPasswordTools(server) {
    server.tool('list_passwords', 'READ-ONLY. List password record metadata in Hudu for a company. Returns names and IDs only — actual password values are not included. Use get_password only when explicitly requested by a human operator.', {
        company_id: z.number().int().describe('Hudu company ID'),
        page: z.number().int().min(1).default(1),
    }, async ({ company_id, page }) => {
        try {
            const { data } = await huduClient.get('/asset_passwords', {
                params: { company_id, page },
            });
            return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return {
                content: [{ type: 'text', text: `Error: ${e instanceof Error ? e.message : String(e)}` }],
                isError: true,
            };
        }
    });
    server.tool('get_password', 'READ-ONLY — SENSITIVE. Retrieves a decrypted password value from Hudu. Only call this when explicitly asked by a human operator. Do not log, quote in summaries, or retransmit the password value.', {
        password_id: z.number().int().describe('Hudu asset_password ID'),
    }, async ({ password_id }) => {
        try {
            const { data } = await huduClient.get(`/asset_passwords/${password_id}`);
            return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return {
                content: [{ type: 'text', text: `Error: ${e instanceof Error ? e.message : String(e)}` }],
                isError: true,
            };
        }
    });
}
//# sourceMappingURL=passwords.js.map