import { execSync } from 'child_process';
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

import { BshError } from '@lib/errors';
import { logger } from '@lib/logger';

import { consts } from '@consts';
import type { InstallOptions } from './types.js';

function gitHooksDir(): string {
  try {
    return execSync('git rev-parse --git-path hooks', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    console.error(error);
    throw new BshError(404, 'Not a Git repository (or hooks path unavailable).');
  }
}

const messageFormatScript = `#!/bin/sh
# BSH Git — commit message format validator
npx @bshsolutions/git commit validate "$1"
`;

function canOverwriteHook(
  path: string,
  force: boolean,
): boolean {
  if (!existsSync(path)) return true;
  if (force) return true;
  try {
    const content = readFileSync(path, 'utf8');
    if (!content.includes(messageFormatScript)) return true;
  } catch (e) {
    const code =
      e &&
        typeof e === 'object' &&
        'code' in e &&
        typeof (e as { code: unknown }).code === 'string'
        ? (e as { code: string }).code
        : '';
    logger.error(`Could not read ${path}${code ? ` (${code})` : ''}.`);
    process.exitCode = 1;
    return false;
  }
  logger.error(`${consts.commit.commitMsgHook} already exists at ${path}. Use --force to replace it.`);
  process.exitCode = 1;
  return false;
}

const writeHookFile = (path: string) => {
  writeFileSync(path, messageFormatScript, { encoding: 'utf8' });
  chmodSync(path, 0o755);
}

export default (options: InstallOptions) => {
  const force = options.force === true;
  const hooksDir = gitHooksDir();
  const commitMsgPath = `${hooksDir}/${consts.commit.commitMsgHook}`;

  if (
    !canOverwriteHook(
      commitMsgPath,
      force,
    )
  ) return;

  writeHookFile(commitMsgPath);

  logger.info(`Installed ${commitMsgPath}`);
};
