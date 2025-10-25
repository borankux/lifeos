# Security

## Threat Model (local app)
- Malicious content in notes/attachments
- IPC misuse from renderer
- Unsanitized inputs reaching DB or filesystem
- Supply-chain risks (dependencies)

## Hardening Checklist
- Disable `nodeIntegration`; enable `contextIsolation`.
- Strict Content Security Policy; no `eval` or inline scripts.
- Preload exposes minimal, validated APIs only.
- Validate all IPC with schemas (Zod) and guard types.
- Sanitize file paths; never join with user-provided `..` segments.
- Limit attachment size and verify MIME by magic bytes.
- Keep dependencies updated; lockfile committed; audit in CI.

## Sensitive Data
- No secrets stored; config stored locally in JSON under userData.
- Consider encrypting backups/exports if user sets a passphrase (future).

