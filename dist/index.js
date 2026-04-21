import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import rateLimit from 'express-rate-limit';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { mcpAuthMiddleware } from './middleware/mcpAuth.js';
import { registerCompanyTools } from './tools/companies.js';
import { registerAssetTools } from './tools/assets.js';
import { registerArticleTools } from './tools/articles.js';
import { registerPasswordTools } from './tools/passwords.js';
import { registerMagicDashTools } from './tools/magicDash.js';
import { registerNetworkTools } from './tools/network.js';
const PORT = parseInt(process.env.PORT ?? '3002', 10);
const streamableTransports = new Map();
const sseTransports = new Map();
function createServer() {
    const server = new McpServer({ name: 'mcp-hudu', version: '1.0.0' });
    registerCompanyTools(server);
    registerAssetTools(server);
    registerArticleTools(server);
    registerPasswordTools(server);
    registerMagicDashTools(server);
    registerNetworkTools(server);
    return server;
}
// Inbound rate limiter — caps how quickly a single IP can call the MCP endpoints.
// This is separate from the outbound client-side rate limiter in client.ts.
const inboundLimiter = rateLimit({
    windowMs: 60_000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests — please slow down' },
});
const app = express();
app.use(cors());
app.use(express.json());
// ─── Health check (no auth) ──────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', server: 'mcp-hudu', port: PORT });
});
// ─── PRIMARY: Streamable HTTP ────────────────────────────────────────────────
app.post('/mcp', mcpAuthMiddleware, inboundLimiter, async (req, res) => {
    const sessionId = req.headers['mcp-session-id'];
    let transport;
    if (sessionId && streamableTransports.has(sessionId)) {
        transport = streamableTransports.get(sessionId);
    }
    else if (!sessionId && isInitializeRequest(req.body)) {
        transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (id) => {
                streamableTransports.set(id, transport);
            },
        });
        transport.onclose = () => {
            if (transport.sessionId)
                streamableTransports.delete(transport.sessionId);
        };
        const server = createServer();
        await server.connect(transport);
    }
    else {
        res.status(400).json({
            error: 'Bad Request: send an InitializeRequest without Mcp-Session-Id to start a new session',
        });
        return;
    }
    await transport.handleRequest(req, res, req.body);
});
app.get('/mcp', mcpAuthMiddleware, inboundLimiter, async (req, res) => {
    const sessionId = req.headers['mcp-session-id'];
    if (!sessionId || !streamableTransports.has(sessionId)) {
        res.status(400).json({ error: 'Invalid or missing Mcp-Session-Id header' });
        return;
    }
    await streamableTransports.get(sessionId).handleRequest(req, res);
});
app.delete('/mcp', mcpAuthMiddleware, async (req, res) => {
    const sessionId = req.headers['mcp-session-id'];
    if (sessionId && streamableTransports.has(sessionId)) {
        await streamableTransports.get(sessionId).close();
        streamableTransports.delete(sessionId);
    }
    res.status(200).json({ ok: true });
});
// ─── FALLBACK: Legacy HTTP+SSE ───────────────────────────────────────────────
app.get('/sse', mcpAuthMiddleware, inboundLimiter, async (req, res) => {
    const transport = new SSEServerTransport('/messages', res);
    const sessionId = randomUUID();
    sseTransports.set(sessionId, transport);
    transport.onclose = () => sseTransports.delete(sessionId);
    const server = createServer();
    await server.connect(transport);
    await transport.start();
});
app.post('/messages', mcpAuthMiddleware, inboundLimiter, async (req, res) => {
    const sessionId = req.query['sessionId'];
    if (!sessionId || !sseTransports.has(sessionId)) {
        res.status(400).json({ error: 'Unknown or expired SSE session' });
        return;
    }
    await sseTransports.get(sessionId).handlePostMessage(req, res, req.body);
});
// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[mcp-hudu] Streamable HTTP : http://0.0.0.0:${PORT}/mcp`);
    console.log(`[mcp-hudu] Legacy SSE      : http://0.0.0.0:${PORT}/sse`);
    console.log(`[mcp-hudu] Health          : http://0.0.0.0:${PORT}/health`);
});
//# sourceMappingURL=index.js.map