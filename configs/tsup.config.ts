import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main/index.ts', 'src/preload/index.ts'],
  splitting: false,
  sourcemap: true,
  clean: false,
  dts: false,
  minify: false,
  format: ['cjs'],
  platform: 'node',
  target: 'node18',
  external: ['electron', 'better-sqlite3']
});
