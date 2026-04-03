import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Command } from 'commander';
import registerCli from '@lib/cli';

vi.mock('@src/commands/commit/cmds/msg/cmds/uninstall/impl.js', () => ({
  default: vi.fn(),
}));

import uninstallDef from '@src/commands/commit/cmds/msg/cmds/uninstall/cmd';
import runUninstall from '@src/commands/commit/cmds/msg/cmds/uninstall/impl.js';

const runUninstallMock = vi.mocked(runUninstall);

function createProgram(): Command {
  const program = new Command();
  program.exitOverride();
  return program;
}

describe('commit msg uninstall command (cmd)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers expected metadata and aliases', () => {
    const program = createProgram();
    registerCli(program, [uninstallDef]);
    const cmd = program.commands[0];

    expect(cmd.name()).toBe('uninstall');
    expect(cmd.aliases()).toEqual(['ui']);
    expect(cmd.description()).toBe('Remove the commit-msg hook installed by install');
  });

  it('parses --force and passes options to implementation', () => {
    const program = createProgram();
    registerCli(program, [uninstallDef]);

    program.parse(['uninstall', '--force'], { from: 'user' });

    expect(runUninstallMock).toHaveBeenCalledTimes(1);
    expect(runUninstallMock).toHaveBeenCalledWith(expect.objectContaining({ force: true }));
  });
});
