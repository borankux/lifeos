import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/main/index.ts',
    'ipc/projects': 'src/main/ipc/projects.ts',
    'ipc/tasks': 'src/main/ipc/tasks.ts',
    'ipc/window': 'src/main/ipc/window.ts',
    'ipc/activities': 'src/main/ipc/activities.ts',
    'ipc/settings': 'src/main/ipc/settings.ts',
    'ipc/notification': 'src/main/ipc/notification.ts',
    'ipc/metrics': 'src/main/ipc/metrics.ts',
    'ipc/qa': 'src/main/ipc/qa.ts',
    'ipc/notebook': 'src/main/ipc/notebook.ts',
  },
  splitting: false,
  sourcemap: true,
  clean: false,
  dts: false,
  minify: false,
  format: ['cjs'],
  platform: 'node',
  target: 'node18',
  external: ['electron', 'better-sqlite3'],
  outExtension() {
    return {
      js: '.js',
    };
  },
});
