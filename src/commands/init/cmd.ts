import type { CommandDefinition } from '@definition';
import { runInit } from './impl.js';

export default {
  name: 'init',
  description: 'Initialize the environment',
  summary: 'Initialize the environment',
  action: async (_options) => {
    await runInit();
  },
} satisfies CommandDefinition;
