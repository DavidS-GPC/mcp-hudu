/**
 * Stdio entry point for Claude Desktop.
 *
 * IMPORTANT: dotenv must be loaded before any other local modules are imported,
 * because client.ts reads process.env at module initialisation time.
 * Static imports are hoisted in ES modules, so we use dynamic imports below
 * to guarantee the env file is loaded first.
 */
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
// ── 1. Load .env before anything else touches process.env ──────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env') });
// ── 2. Dynamic imports — evaluated only after config() has run ─────────────
const { McpServer } = await import('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');
const { registerCompanyTools } = await import('./tools/companies.js');
const { registerAssetTools } = await import('./tools/assets.js');
const { registerArticleTools } = await import('./tools/articles.js');
const { registerPasswordTools } = await import('./tools/passwords.js');
const { registerMagicDashTools } = await import('./tools/magicDash.js');
// ── 3. Wire up server ──────────────────────────────────────────────────────
const server = new McpServer({ name: 'mcp-hudu', version: '1.0.0' });
registerCompanyTools(server);
registerAssetTools(server);
registerArticleTools(server);
registerPasswordTools(server);
registerMagicDashTools(server);
const transport = new StdioServerTransport();
await server.connect(transport);
//# sourceMappingURL=stdio.js.map