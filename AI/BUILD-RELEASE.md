# Build & Release

## Build
- Package with `electron-builder` for win/mac/linux targets.
- Separate dev and prod configs; enable ASAR; exclude dev-only files.

## Code Signing
- Optional for MVP; document signing setup for Windows (.pfx) and macOS (Developer ID).

## Auto-Update
- Integrate `electron-updater`; optional local feed or GitHub Releases.
- Update flow: check on startup and About dialog; show release notes.

## Versioning
- SemVer; bump via `release` script; changelog generated from conventional commits.

## Crash/Telemetry
- Local logs only by default; provide opt-in telemetry stub for future.

