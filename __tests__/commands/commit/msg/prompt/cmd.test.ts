import { describe, expect, it, vi } from 'vitest';
import { Command } from 'commander';
import registerCli from '@lib/cli';

vi.mock('@src/commands/commit/cmds/msg/cmds/prompt/impl.js', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

import promptDef from '@src/commands/commit/cmds/msg/cmds/prompt/cmd';
import runPrompt from '@src/commands/commit/cmds/msg/cmds/prompt/impl.js';

const runPromptMock = vi.mocked(runPrompt);

function createProgram(): Command {
  const program = new Command();
  program.exitOverride();
  return program;
}

describe('commit msg prompt command (cmd)', () => {
  it('registers metadata, alias, and options', () => {
    const program = createProgram();
    registerCli(program, [promptDef]);
    const cmd = program.commands[0];

    expect(cmd.name()).toBe('prompt');
    expect(cmd.aliases()).toEqual(['p']);
    expect(cmd.options.map((o) => o.long)).toContain('--dry-run');
    expect(cmd.options.map((o) => o.long)).toContain('--skip-verify');
  });

  it('invokes implementation with parsed flags', async () => {
    const program = createProgram();
    registerCli(program, [promptDef]);

    program.parse(['prompt', '--dry-run', '--skip-verify'], { from: 'user' });

    await vi.waitFor(() => {
      expect(runPromptMock).toHaveBeenCalled();
    });
    expect(runPromptMock).toHaveBeenCalledWith({
      dryRun: true,
      skipVerify: true,
    });
  });
});
