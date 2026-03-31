import { readdirSync, rmdirSync, unlinkSync } from 'fs';
import { dirname, resolve } from 'path';
import { consts } from '@src/config/consts';
import { logger } from '@lib/logger';

export function runRm(): void {
  rmConfigFile();
}

function rmConfigFile(): void {
  const configPath = resolve(process.cwd(), consts.configRelativePath);
  const configDirPath = dirname(configPath);

  try {
    unlinkSync(configPath);
  } catch (err) {
    if (getNodeErrno(err) !== 'ENOENT') throw err;
    return;
  }

  try {
    if (readdirSync(configDirPath).length === 0) {
      rmdirSync(configDirPath);
    }
  } catch (err) {
    if (
      getNodeErrno(err) !== 'ENOENT' &&
      getNodeErrno(err) !== 'ENOTEMPTY'
    ) {
      throw err;
    }
  }

  logger.info('Config file removed');
}

function getNodeErrno(err: unknown): NodeJS.ErrnoException['code'] {
  if (!err || typeof err !== 'object' || !('code' in err)) return undefined;
  return (err as NodeJS.ErrnoException).code;
}
