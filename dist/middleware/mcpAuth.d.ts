import { Request, Response, NextFunction } from 'express';
/**
 * Guards MCP endpoints with a shared secret.
 * Accepts either:
 *   Authorization: Bearer <key>
 *   x-mcp-key: <key>
 */
export declare function mcpAuthMiddleware(req: Request, res: Response, next: NextFunction): void;
