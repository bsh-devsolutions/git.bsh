import type { UninstallOptions } from './types.js';
import { logger } from '@lib/logger';
import { consts } from '@consts';
import { gitHooksDir, messageFormatScript } from '../install/utils.js';
import { existsSync, readFileSync, unlinkSync } from 'fs';

export default (options: UninstallOptions): void => {
  const force = options.force === true;
  const hooksDir = gitHooksDir();
  const commitMsgPath = `${hooksDir}/${consts.commit.commitMsgHook}`;

  if (!existsSync(commitMsgPath)) {
    logger.info(`No ${consts.commit.commitMsgHook} hook found at ${commitMsgPath}`);
    return;
  }

  if (!force) {
    let content = '';
    try {
      content = readFileSync(commitMsgPath, 'utf8');
    } catch (err) {
      const code =
        err &&
          typeof err === 'object' &&
          'code' in err &&
          typeof (err as { code: unknown }).code === 'string'
          ? (err as { code: string }).code
          : '';
      logger.error(`Could not read ${commitMsgPath}${code ? ` (${code})` : ''}.`);
      process.exitCode = 1;
      return;
    }

    if (!content.includes(messageFormatScript)) {
      logger.error(
        `${consts.commit.commitMsgHook} at ${commitMsgPath} was not installed by this tool. Use --force to remove it.`,
      );
      process.exitCode = 1;
      return;
    }
  }

  unlinkSync(commitMsgPath);
  logger.info(`Removed ${commitMsgPath}`);
}
