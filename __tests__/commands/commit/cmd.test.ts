/**
 * Parent `commit` command: subcommands only, no top-level action.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import registerCli from '@lib/cli';

vi.mock('@src/commands/commit/cmds/install/impl.js', () => ({
  runInstall: vi.fn(),
}));
vi.mock('@src/commands/commit/cmds/validate/impl.js', () => ({
  runValidate: vi.fn(),
}));
vi.mock('@src/commands/commit/cmds/uninstall/impl.js', () => ({
  runUninstall: vi.fn(),
}));

import commitDef from '@commands/commit';
import { runInstall } from '@src/commands/commit/cmds/install/impl.js';
import { runValidate } from '@src/commands/commit/cmds/validate/impl.js';
import { runUninstall } from '@src/commands/commit/cmds/uninstall/impl.js';

const runInstallMock = vi.mocked(runInstall);
const runValidateMock = vi.mocked(runValidate);
const runUninstallMock = vi.mocked(runUninstall);

function createProgram(): Command {
  const program = new Command();
  program.exitOverride();
  return program;
}

function registeredCommitCommand(program: Command): Command {
  registerCli(program, [commitDef]);
  expect(program.commands).toHaveLength(1);
  return program.commands[0];
}

describe('commit command (cmd)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('metadata', () => {
    it('registers name, description, and summary', () => {
      const cmd = registeredCommitCommand(createProgram());

      expect(cmd.name()).toBe('commit');
      expect(cmd.description()).toBe('Structured commit messages: `<type> (scope): msg`');
      expect(cmd.summary()).toBe('Validate commits and manage the commit-msg hook');
    });
  });

  describe('aliases', () => {
    it('registers alias c', () => {
      const cmd = registeredCommitCommand(createProgram());

      expect(cmd.aliases()).toEqual(expect.arrayContaining(['c']));
    });
  });

  describe('subcommands', () => {
    it('registers install, validate, and uninstall', () => {
      const cmd = registeredCommitCommand(createProgram());
      const names = cmd.commands.map((c) => c.name()).sort();

      expect(names).toEqual(['install', 'uninstall', 'validate']);
    });
  });

  describe('parses nested actions', () => {
    it('invokes runValidate for commit validate', () => {
      const program = createProgram();
      registerCli(program, [commitDef]);

      program.parse(['commit', 'validate'], { from: 'user' });

      expect(runValidateMock).toHaveBeenCalledTimes(1);
      expect(runValidateMock).toHaveBeenCalledWith();
      expect(runInstallMock).not.toHaveBeenCalled();
      expect(runUninstallMock).not.toHaveBeenCalled();
    });

    it('invokes runInstall with options for commit install --force', () => {
      const program = createProgram();
      registerCli(program, [commitDef]);

      program.parse(['commit', 'install', '--force'], { from: 'user' });

      expect(runInstallMock).toHaveBeenCalledTimes(1);
      expect(runInstallMock).toHaveBeenCalledWith({ force: true });
    });

    it('accepts short alias c for commit', () => {
      const program = createProgram();
      registerCli(program, [commitDef]);

      program.parse(['c', 'validate'], { from: 'user' });

      expect(runValidateMock).toHaveBeenCalledTimes(1);
    });
  });
});
