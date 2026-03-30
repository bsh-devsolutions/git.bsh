import type { CommandDefinition } from '@definition';
import init from '@commands/init';
import commitMsg from '@src/commands/commit/cmd';

const commands: CommandDefinition[] = [
    init,
    commitMsg,
];
export default commands;
