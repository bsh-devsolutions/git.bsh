import { execSync } from 'child_process';
import { chmodSync, existsSync, realpathSync, writeFileSync } from 'fs';

import { BshError } from '@errors';
import { logger } from '@logger';

import type { InstallOptions } from './types.js';
import { consts } from '../const.js';

function gitHooksDir(): string {
  try {
    return execSync('git rev-parse --git-path hooks', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch {
    throw new BshError(404, 'Not a Git repository (or hooks path unavailable).');
  }
}

function resolveHookInvoker(): string {
  const env = process.env.ENV?.trim();
  if (env == 'local') {
    return 'npm run cli --';
  }
  return 'npx @bshsolutions/git.bsh';
}

function hookScript(): string {
  const invoker = resolveHookInvoker();
  return `#!/bin/sh
set -e
${invoker} commit validate "$1"
`;
}

export function runInstall(options: InstallOptions): void {
  const hooksDir = gitHooksDir();
  const hookPath = `${hooksDir}/${consts.commit.messageHook}`;

  if (existsSync(hookPath) && !options.force) {
    logger.error(
      `${consts.commit.messageHook} hook already exists at ${hookPath}. Use --force to replace it.`,
    );
    process.exitCode = 1;
    return;
  }

  writeFileSync(hookPath, hookScript(), { encoding: 'utf8' });
  chmodSync(hookPath, 0o755);
  logger.info(`Installed ${consts.commit.messageHook} hook at ${hookPath}`);
}
