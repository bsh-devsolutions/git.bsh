import type { CommandDefinition } from '@definition';
import hello from '@commands/hello';
import commitMsg from '@src/commands/commit/cmd';

const commands: CommandDefinition[] = [hello, commitMsg];
export default commands;
