import type { CommandDefinition } from '@definition';

import { runValidate } from './impl.js';

export default {
  name: 'validate',
  aliases: ['v'],
  description: 'Validate a commit message',
  action: (_options) => {
    runValidate();
  },
} satisfies CommandDefinition;
