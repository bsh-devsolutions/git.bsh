import type { CommandDefinition } from '@definition';
import init from '@commands/init';
import rm from '@commands/rm';
import commitMsg from '@commands/commit';

const commands: CommandDefinition[] = [
    init,
    rm,
    commitMsg,
];
export default commands;
