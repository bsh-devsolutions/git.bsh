import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Command } from 'commander';
import registerCli from '@lib/cli';

vi.mock('@src/commands/commit/cmds/msg/cmds/validate/impl.js', () => ({
  default: vi.fn(),
}));

import validateDef from '@src/commands/commit/cmds/msg/cmds/validate/cmd';
import runValidate from '@src/commands/commit/cmds/msg/cmds/validate/impl.js';

const runValidateMock = vi.mocked(runValidate);

function createProgram(): Command {
  const program = new Command();
  program.exitOverride();
  return program;
}

describe('commit msg validate command (cmd)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers metadata, alias, and argument syntax', () => {
    const program = createProgram();
    registerCli(program, [validateDef]);
    const cmd = program.commands[0];

    expect(cmd.name()).toBe('validate');
    expect(cmd.aliases()).toEqual(['v']);
    expect(cmd.description()).toBe('Validate a commit message');
    expect(cmd.usage()).toContain('[message-or-file]');
  });

  it('forwards parsed message/file input to implementation', () => {
    const program = createProgram();
    registerCli(program, [validateDef]);

    program.parse(['validate', 'feat(core): add tests'], { from: 'user' });

    expect(runValidateMock).toHaveBeenCalledTimes(1);
    expect(runValidateMock).toHaveBeenCalledWith('feat(core): add tests');
  });
});
