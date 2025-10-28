/**
 * MCP Security Middleware
 * Enforces MCP-specific security and protocol requirements
 */

import { Request, Response, NextFunction } from 'express';
import * as sseManager from '../utils/sseManager';

// Supported MCP protocol versions
const SUPPORTED_PROTOCOL_VERSIONS = ['2025-06-18'];

// Default origin whitelist (localhost variations)
const DEFAULT_ORIGIN_WHITELIST = [
  'http://localhost',
  'http://127.0.0.1',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'null', // For local file access
];

/**
 * MCP Security Middleware Configuration
 */
interface McpSecurityConfig {
  enforceProtocolVersion?: boolean;
  enforceOrigin?: boolean;
  originWhitelist?: string[];
  requireSession?: boolean;
}

/**
 * Create MCP security middleware
 */
export function createMcpSecurity(config: McpSecurityConfig = {}) {
  const {
    enforceProtocolVersion = true,
    enforceOrigin = true,
    originWhitelist = DEFAULT_ORIGIN_WHITELIST,
    requireSession = false,
  } = config;

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Protocol Version Validation (Relaxed)
      const protocolVersion = req.get('MCP-Protocol-Version');
      
      if (enforceProtocolVersion) {
        // Strict mode: require and validate version
        if (!protocolVersion) {
          return res.status(400).json({
            error: {
              code: 'MISSING_PROTOCOL_VERSION',
              message: 'MCP-Protocol-Version header is required',
              supportedVersions: SUPPORTED_PROTOCOL_VERSIONS,
            },
          });
        }

        if (!SUPPORTED_PROTOCOL_VERSIONS.includes(protocolVersion)) {
          return res.status(400).json({
            error: {
              code: 'UNSUPPORTED_PROTOCOL_VERSION',
              message: `Protocol version ${protocolVersion} is not supported`,
              supportedVersions: SUPPORTED_PROTOCOL_VERSIONS,
            },
          });
        }

        // Echo protocol version in response
        res.setHeader('MCP-Protocol-Version', protocolVersion);
      } else {
        // Relaxed mode: version is optional
        if (protocolVersion) {
          // If provided and supported, echo it back
          if (SUPPORTED_PROTOCOL_VERSIONS.includes(protocolVersion)) {
            res.setHeader('MCP-Protocol-Version', protocolVersion);
          }
          // If provided but not supported, log warning but continue
          else {
            console.warn(`[MCP Security] Unsupported protocol version: ${protocolVersion}, continuing anyway (relaxed mode)`);
          }
        }
        // If not provided, continue without version header (compatible with mcp-remote)
      }

      // 2. Origin Validation (DNS Rebinding Defense)
      if (enforceOrigin) {
        const origin = req.get('Origin');
        
        // Origin header is not always present (e.g., same-origin requests)
        // Only validate if present
        if (origin) {
          const isAllowed = originWhitelist.some(allowedOrigin => {
            if (allowedOrigin === '*') return true;
            if (allowedOrigin === origin) return true;
            
            // Support wildcard subdomains like *.example.com
            if (allowedOrigin.startsWith('*.')) {
              const domain = allowedOrigin.slice(2);
              return origin.endsWith(domain);
            }
            
            return false;
          });

          if (!isAllowed) {
            return res.status(403).json({
              error: {
                code: 'FORBIDDEN_ORIGIN',
                message: `Origin ${origin} is not allowed`,
              },
            });
          }
        }
      }

      // 3. Session ID Validation (if present)
      const sessionId = req.get('Mcp-Session-Id');
      if (sessionId) {
        if (!sseManager.isValidSessionId(sessionId)) {
          return res.status(400).json({
            error: {
              code: 'INVALID_SESSION_ID',
              message: 'Mcp-Session-Id must be a valid UUID',
            },
          });
        }

        // Echo session ID in response
        res.setHeader('Mcp-Session-Id', sessionId);
      } else if (requireSession) {
        return res.status(400).json({
          error: {
            code: 'MISSING_SESSION_ID',
            message: 'Mcp-Session-Id header is required',
          },
        });
      }

      // 4. Content-Type Validation for POST requests
      if (req.method === 'POST') {
        const contentType = req.get('Content-Type');
        
        if (!contentType || !contentType.includes('application/json')) {
          return res.status(415).json({
            error: {
              code: 'UNSUPPORTED_MEDIA_TYPE',
              message: 'Content-Type must be application/json',
            },
          });
        }
      }

      // All checks passed
      next();
    } catch (error: any) {
      console.error('MCP security middleware error:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal security validation error',
        },
      });
    }
  };
}

/**
 * Strict MCP security (all checks enabled)
 */
export const strictMcpSecurity = createMcpSecurity({
  enforceProtocolVersion: true,
  enforceOrigin: true,
  requireSession: false, // Session is optional for initial requests
});

/**
 * Relaxed MCP security (for development)
 */
export const relaxedMcpSecurity = createMcpSecurity({
  enforceProtocolVersion: false,
  enforceOrigin: false,
  requireSession: false,
});

/**
 * Legacy endpoint security (no MCP headers required)
 */
export const legacySecurity = createMcpSecurity({
  enforceProtocolVersion: false,
  enforceOrigin: true,
  requireSession: false,
});
