import { z } from 'zod';
import { huduClient } from '../client.js';
export function registerMagicDashTools(server) {
    server.tool('update_magic_dash', 'Push a status update to a Hudu Magic Dash widget. Hudu upserts by company + title — if a widget with this title already exists for the company, it will be updated; otherwise a new one is created.', {
        company_id: z.number().int().describe('Hudu company ID the widget belongs to'),
        title: z
            .string()
            .describe('Widget title/identifier — must match the existing Magic Dash item name exactly, or a new widget will be created'),
        message: z.string().describe('Status message to display on the widget'),
        status: z
            .enum(['success', 'warning', 'danger', 'info'])
            .describe('Widget colour/state indicator'),
        icon: z
            .string()
            .optional()
            .describe('FontAwesome icon class, e.g. "fas fa-check" or "fas fa-exclamation-triangle"'),
        link_url: z.string().url().optional().describe('Optional URL to link the widget to'),
    }, async ({ company_id, title, message, status, icon, link_url }) => {
        try {
            const payload = { company_id, title, message, status };
            if (icon)
                payload.icon = icon;
            if (link_url)
                payload.link_url = link_url;
            const { data } = await huduClient.post('/magic_dash', payload);
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
//# sourceMappingURL=magicDash.js.map