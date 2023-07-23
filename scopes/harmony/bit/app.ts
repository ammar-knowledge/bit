/* eslint-disable import/no-dynamic-require */
/* eslint-disable import/first */
process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('uncaughtException', err);
  process.exit(1);
});

import { nativeCompileCache } from '@teambit/toolbox.performance.v8-cache';

// Enable v8 compile cache, keep this before other imports
nativeCompileCache?.install();

import './hook-require';
import { bootstrap } from '@teambit/legacy/dist/bootstrap';
import { handleErrorAndExit } from '@teambit/legacy/dist/cli/handle-errors';
import { runCLI } from './load-bit';

// Export APIs from all core aspects to be used in the bundled app
// export * from './core-aspects-exports';

// eslint-disable-next-line @typescript-eslint/no-floating-promises
initApp();

async function initApp() {
  try {
    await bootstrap();
    // registerCoreExtensions();
    // const harmony = await Harmony.load([ConfigExt], {});
    await runCLI();
  } catch (err: any) {
    const originalError = err.originalError || err;
    await handleErrorAndExit(originalError, process.argv[2]);
  }
}
