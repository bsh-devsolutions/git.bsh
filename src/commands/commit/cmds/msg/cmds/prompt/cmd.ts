import type { CommandDefinition } from '@definition';

import { logger } from '@lib/logger';

import run from './impl.js';

export default {
  name: 'prompt',
  aliases: ['p'],
  description:
    'Interactively choose type, scope, and message per your config format, then run git commit',
  summary: 'Prompt using configured format and types/scopes, then commit',
  options: [
    {
      flags: '--dry-run',
      description: 'Print the composed message without running git commit',
      defaultValue: false,
    },
    {
      flags: '--skip-verify',
      description: 'Run git commit with --no-verify (skip hooks)',
      defaultValue: false,
    },
  ],
  action: (options: { dryRun?: boolean; skipVerify?: boolean }) => {
    void run(options).catch((e: unknown) => {
      logger.error(e instanceof Error ? e.message : String(e));
      process.exitCode = 1;
    });
  },
} satisfies CommandDefinition;
