# Electron Mirror Guidance (China Mainland)

## npm / pnpm Registry
- Prefer the npmmirror (formerly Taobao) registry: `https://registry.npmmirror.com`
- Configure once per machine:

```bash
npm config set registry https://registry.npmmirror.com
pnpm config set registry https://registry.npmmirror.com
```

- For yarn classic:

```bash
yarn config set registry https://registry.npmmirror.com
```

## Electron Binary Mirror
- Set `ELECTRON_MIRROR` so electron downloads from npmmirror CDN:

```powershell
$env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"
```

- For npm scripts, add to `.npmrc` (cross-shell):

```
electron_mirror=https://npmmirror.com/mirrors/electron/
```

- pnpm users add to `.npmrc` or `.pnpmrc`:

```
electron_mirror=https://npmmirror.com/mirrors/electron/
```

## Electron Builder Assets
- Ensure `electron-builder` pulls win/mac/linux toolchains from mirror:

```powershell
$env:ELECTRON_BUILDER_BINARIES_MIRROR = "https://npmmirror.com/mirrors/electron-builder-binaries/"
$env:S3_CDN = "https://npmmirror.com/mirrors/electron-builder-binaries/"
```

- Add to configuration for CI (package.json scripts):

```json
{
  "scripts": {
    "build:win": "cross-env ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/ electron-builder --win"
  }
}
```

## Manual Download Fallback
- Direct binaries: `https://npmmirror.com/mirrors/electron/`
- Download required version, place under `~/.electron` (mac/linux) or `%LOCALAPPDATA%\electron\Cache` (Windows) named `electron-v<version>-win32-x64.zip` etc.

## Troubleshooting
- Clear previous failed caches: delete `%LOCALAPPDATA%\electron\Cache` or `~/.cache/electron`.
- Verify registry by `npm config get registry`.
- If corporate proxy in place, set `HTTPS_PROXY` / `http_proxy` before running install.
- Use `npm install --verbose` to confirm mirror URL is used.

