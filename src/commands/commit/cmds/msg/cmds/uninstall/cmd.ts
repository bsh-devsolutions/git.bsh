import type { CommandDefinition } from '@definition';

import run from './impl.js';
import type { UninstallOptions } from './types.js';

export default {
  name: 'uninstall',
  aliases: ['ui'],
  description: 'Remove the commit-msg hook installed by install',
  options: [
    {
      flags: '-f, --force',
      description: 'Remove the hook even if it was not installed by this tool',
      defaultValue: false,
    },
  ],
  action: (options) => run(options),
} satisfies CommandDefinition<UninstallOptions>;
