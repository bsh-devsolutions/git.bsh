/**
 * Commander wiring for `commit validate`.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import registerCli from '@lib/cli';

vi.mock('@src/commands/commit/cmds/validate/impl.js', () => ({
  runValidate: vi.fn(),
}));

import commitDef from '@commands/commit';
import { runValidate } from '@src/commands/commit/cmds/validate/impl.js';

const runValidateMock = vi.mocked(runValidate);

function createProgram(): Command {
  const program = new Command();
  program.exitOverride();
  return program;
}

function validateCommand(program: Command): Command {
  registerCli(program, [commitDef]);
  const commit = program.commands[0];
  const nested = commit.commands.find((c) => c.name() === 'validate');
  expect(nested).toBeDefined();
  return nested!;
}

describe('commit validate (cmd)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('metadata', () => {
    it('registers name and description', () => {
      const cmd = validateCommand(createProgram());

      expect(cmd.name()).toBe('validate');
      expect(cmd.description()).toBe('Validate a commit message');
    });
  });

  describe('aliases', () => {
    it('registers alias v', () => {
      const cmd = validateCommand(createProgram());

      expect(cmd.aliases()).toEqual(expect.arrayContaining(['v']));
    });
  });

  describe('options', () => {
    it('defines no custom options', () => {
      const cmd = validateCommand(createProgram());

      expect(cmd.options).toHaveLength(0);
    });
  });

  describe('action', () => {
    it('invokes runValidate when parsed', () => {
      const program = createProgram();
      registerCli(program, [commitDef]);

      program.parse(['commit', 'validate'], { from: 'user' });

      expect(runValidateMock).toHaveBeenCalledTimes(1);
      expect(runValidateMock).toHaveBeenCalledWith();
    });
  });

  describe('subcommands', () => {
    it('has no nested commands', () => {
      const cmd = validateCommand(createProgram());

      expect(cmd.commands).toHaveLength(0);
    });
  });
});
