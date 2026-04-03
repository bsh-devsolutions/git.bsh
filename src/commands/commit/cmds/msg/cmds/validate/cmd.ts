import type { CommandDefinition } from '@definition';

import run from './impl.js';

export default {
  name: 'validate',
  aliases: ['v'],
  description: 'Validate a commit message',
  argumentSyntax: '[message-or-file]',
  action: (_options, input) => run(input),
} satisfies CommandDefinition;
