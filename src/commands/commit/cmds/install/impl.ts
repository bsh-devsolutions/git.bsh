import { logger } from '@lib/logger';
import { getConfig, mergeConfigFile } from '@config';

import { consts } from '@consts';
import type { InstallOptions } from './types.js';
import { canOverwriteHook, gitHooksDir, promptMessageConfig, writeHookFile } from './utils.js';

export default async (options: InstallOptions) => {
  const force = options.force === true;
  const hooksDir = gitHooksDir();
  const commitMsgPath = `${hooksDir}/${consts.commit.commitMsgHook}`;

  if (!canOverwriteHook(commitMsgPath, force)) {
    process.exitCode = 1;
    logger.error(`${consts.commit.commitMsgHook} already exists at ${commitMsgPath}. Use --force to replace it.`);
    return;
  }

  const currentMessageConfig = getConfig().commit.message;
  const messageConfig = await promptMessageConfig(currentMessageConfig);

  await mergeConfigFile({
    commit: {
      message: messageConfig,
    },
  });

  writeHookFile(commitMsgPath);

  logger.info(`Installed ${commitMsgPath}`);
};
