import type { CommandDefinition } from '@definition';
import { runRm } from './impl.js';

export default {
  name: 'rm',
  description: 'Remove CLI config from this project',
  summary: 'Undo init by removing project config',
  action: (_options) => {
    runRm();
  },
} satisfies CommandDefinition;
