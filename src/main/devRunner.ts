import path from 'path';
import { spawn } from 'child_process';
import waitOn from 'wait-on';
import electron from 'electron';

async function start() {
  const devServerUrl = process.env.VITE_DEV_SERVER_URL ?? 'http://localhost:5173';
  await waitOn({
    resources: [devServerUrl],
    timeout: 60_000,
    validateStatus: status => status === 200
  });

  const mainEntry = path.resolve(__dirname, 'index.ts');

  // Use require.resolve to get the actual path to electron executable
  const electronPath = require.resolve('electron');
  
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: 'development',
    VITE_DEV_SERVER_URL: devServerUrl
  };
  delete env.ELECTRON_RUN_AS_NODE;

  const child = spawn(electronPath, ['-r', 'ts-node/register', mainEntry], {
    stdio: 'inherit',
    env
  });

  child.on('close', code => {
    process.exit(code === null ? 0 : code);
  });
}

start().catch(error => {
  console.error('Failed to start Electron dev runner', error);
  process.exit(1);
});
