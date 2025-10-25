import path from 'path';
import { spawn } from 'child_process';
import waitOn from 'wait-on';

const electronBinary = require('electron') as string;

async function start() {
  const devServerUrl = process.env.VITE_DEV_SERVER_URL ?? 'http://localhost:5173';
  await waitOn({
    resources: [devServerUrl],
    timeout: 60_000,
    validateStatus: status => status === 200
  });

  const mainEntry = path.resolve(__dirname, 'index.ts');
  const tsconfig = path.resolve(__dirname, '../../tsconfig.main.json');

  const child = spawn(electronBinary, ['-r', 'ts-node/register/transpile-only', mainEntry], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      VITE_DEV_SERVER_URL: devServerUrl,
      TS_NODE_PROJECT: tsconfig
    }
  });

  child.on('close', code => {
    process.exit(code === null ? 0 : code);
  });
}

start().catch(error => {
  console.error('Failed to start Electron dev runner', error);
  process.exit(1);
});
