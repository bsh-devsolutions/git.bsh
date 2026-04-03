import type { SubCommandDefinition } from '@definition';

import run from './impl.js';
import type { InstallOptions } from './types.js';

export default {
  name: 'install',
  aliases: ['i'],
  description: 'Write a commit-msg hook that enforces the message format',
  options: [
    {
      flags: '-f, --force',
      description: 'Replace an existing commit-msg hook',
      defaultValue: false,
    },
  ],
  action: (options) => run(options),
} satisfies SubCommandDefinition<InstallOptions>;
