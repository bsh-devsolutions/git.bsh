import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Command } from 'commander';
import registerCli from '@lib/cli';

vi.mock('@src/commands/commit/cmds/msg/cmds/install/impl.js', () => ({
  default: vi.fn(),
}));

import installDef from '@src/commands/commit/cmds/msg/cmds/install/cmd';
import runInstall from '@src/commands/commit/cmds/msg/cmds/install/impl.js';

const runInstallMock = vi.mocked(runInstall);

function createProgram(): Command {
  const program = new Command();
  program.exitOverride();
  return program;
}

describe('commit msg install command (cmd)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers expected metadata and aliases', () => {
    const program = createProgram();
    registerCli(program, [installDef]);
    const cmd = program.commands[0];

    expect(cmd.name()).toBe('install');
    expect(cmd.aliases()).toEqual(['i']);
    expect(cmd.description()).toBe('Write a commit-msg hook that enforces the message format');
  });

  it('parses --force and passes options to implementation', () => {
    const program = createProgram();
    registerCli(program, [installDef]);

    program.parse(['install', '--force'], { from: 'user' });

    expect(runInstallMock).toHaveBeenCalledTimes(1);
    expect(runInstallMock).toHaveBeenCalledWith(expect.objectContaining({ force: true }));
  });
});
