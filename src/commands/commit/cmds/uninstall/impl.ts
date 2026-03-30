import { execSync } from 'child_process';
import { existsSync, readFileSync, unlinkSync } from 'fs';

import { BshError } from '@lib/errors';
import { logger } from '@lib/logger';

import type { UninstallOptions } from './types.js';
import { consts } from '../const.js';


function looksLikeBshGitHook(contents: string): boolean {
  return contents.includes('commit validate');
}

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

export function runUninstall(options: UninstallOptions): void {
  const hooksDir = gitHooksDir();
  const hookPath = `${hooksDir}/${consts.commit.messageHook}`;

  if (!existsSync(hookPath)) {
    logger.info(`No ${consts.commit.messageHook} hook at ${hookPath}.`);
    return;
  }

  let contents: string;
  try {
    contents = readFileSync(hookPath, 'utf8');
  } catch (e) {
    const code =
      e &&
      typeof e === 'object' &&
      'code' in e &&
      typeof (e as { code: unknown }).code === 'string'
        ? (e as { code: string }).code
        : '';
    logger.error(`Could not read ${hookPath}${code ? ` (${code})` : ''}.`);
    process.exitCode = 1;
    return;
  }

  if (!looksLikeBshGitHook(contents) && !options.force) {
    logger.error(
      `${consts.commit.messageHook} hook at ${hookPath} does not look like the one installed by this tool. Use --force to remove it anyway.`,
    );
    process.exitCode = 1;
    return;
  }

  unlinkSync(hookPath);
  logger.info(`Removed ${consts.commit.messageHook} hook at ${hookPath}`);
}
