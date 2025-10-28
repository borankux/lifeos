import { getDb } from './init';
import { MCPConfig, UpdateMCPConfigPayload } from '../common/types';

export function getMCPConfig(): MCPConfig {
  const db = getDb();
  const result = db.prepare(`
    SELECT 
      id,
      port,
      host,
      enabled,
      auto_start as autoStart,
      created_at as createdAt,
      updated_at as updatedAt
    FROM mcp_config
    WHERE id = 1
  `).get();

  return result as MCPConfig;
}

export function updateMCPConfig(payload: UpdateMCPConfigPayload): MCPConfig {
  const db = getDb();

  // Build dynamic UPDATE statement
  const updates: string[] = [];
  const params: any[] = [];

  if (payload.port !== undefined) {
    updates.push('port = ?');
    params.push(payload.port);
  }
  if (payload.host !== undefined) {
    updates.push('host = ?');
    params.push(payload.host);
  }
  if (payload.enabled !== undefined) {
    updates.push('enabled = ?');
    params.push(payload.enabled ? 1 : 0);
  }
  if (payload.autoStart !== undefined) {
    updates.push('auto_start = ?');
    params.push(payload.autoStart ? 1 : 0);
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(1); // For WHERE clause

  const query = `
    UPDATE mcp_config
    SET ${updates.join(', ')}
    WHERE id = ?
  `;

  db.prepare(query).run(...params);

  return getMCPConfig();
}
