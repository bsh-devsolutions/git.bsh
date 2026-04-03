import { createConfigFileIfNotExists } from '@config';
import { logger } from '@lib/logger';

import { access } from 'fs/promises';
import { resolve } from 'path';
import { consts } from '@src/config/consts';
import { getNodeErrno } from '@src/config/utils';

async function configExists(): Promise<boolean> {
  const configPath = resolve(process.cwd(), consts.configRelativePath);
  try {
    await access(configPath);
    return true;
  } catch (err) {
    if (getNodeErrno(err) === 'ENOENT') return false;
    throw err;
  }
}

export async function runInit(): Promise<void> {
  const existed = await configExists();
  await createConfigFileIfNotExists();
  if (!existed) logger.info('Config file created');
}
