import { z } from 'zod';
import { huduClient, paginateAll } from '../client.js';
export function registerArticleTools(server) {
    server.tool('list_articles', 'List Hudu knowledge base articles. Optionally filter by company.', {
        page: z.number().int().min(1).default(1),
        company_id: z.number().int().optional().describe('Filter to a specific company'),
    }, async ({ page, company_id }) => {
        try {
            const params = { page };
            if (company_id)
                params.company_id = company_id;
            const { data } = await huduClient.get('/articles', { params });
            return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return {
                content: [{ type: 'text', text: `Error: ${e instanceof Error ? e.message : String(e)}` }],
                isError: true,
            };
        }
    });
    server.tool('get_article', 'Get the full content of a specific Hudu knowledge base article by its numeric ID.', {
        article_id: z.number().int().describe('Hudu article ID'),
    }, async ({ article_id }) => {
        try {
            const { data } = await huduClient.get(`/articles/${article_id}`);
            return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return {
                content: [{ type: 'text', text: `Error: ${e instanceof Error ? e.message : String(e)}` }],
                isError: true,
            };
        }
    });
    server.tool('create_article', 'Create a new Hudu knowledge base article. Content supports HTML.', {
        name: z.string().describe('Article title'),
        content: z.string().describe('Article body (HTML supported)'),
        company_id: z.number().int().optional().describe('Associate with a specific company'),
        folder_id: z.number().int().optional().describe('Place in a specific folder'),
    }, async ({ name, content, company_id, folder_id }) => {
        try {
            const body = { name, content };
            if (company_id)
                body.company_id = company_id;
            if (folder_id)
                body.folder_id = folder_id;
            const { data } = await huduClient.post('/articles', { article: body });
            return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return {
                content: [{ type: 'text', text: `Error: ${e instanceof Error ? e.message : String(e)}` }],
                isError: true,
            };
        }
    });
    server.tool('search_articles', 'Search Hudu articles by title across all pages. Optionally scope to a company.', {
        query: z.string().min(2).describe('Article title to search for (partial match)'),
        company_id: z.number().int().optional().describe('Limit search to a specific company'),
    }, async ({ query, company_id }) => {
        try {
            const params = { name: query };
            if (company_id)
                params.company_id = company_id;
            const articles = await paginateAll('/articles', 'articles', params);
            return { content: [{ type: 'text', text: JSON.stringify(articles, null, 2) }] };
        }
        catch (e) {
            return {
                content: [{ type: 'text', text: `Error: ${e instanceof Error ? e.message : String(e)}` }],
                isError: true,
            };
        }
    });
}
//# sourceMappingURL=articles.js.map