/**
 * Commander wiring for `commit install`.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import registerCli from '@lib/cli';

vi.mock('@src/commands/commit/cmds/install/impl.js', () => ({
  runInstall: vi.fn(),
}));

import commitDef from '@commands/commit';
import { runInstall } from '@src/commands/commit/cmds/install/impl.js';

const runInstallMock = vi.mocked(runInstall);

function createProgram(): Command {
  const program = new Command();
  program.exitOverride();
  return program;
}

function installCommand(program: Command): Command {
  registerCli(program, [commitDef]);
  const commit = program.commands[0];
  const nested = commit.commands.find((c) => c.name() === 'install');
  expect(nested).toBeDefined();
  return nested!;
}

describe('commit install (cmd)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('metadata', () => {
    it('registers name and description on the nested command', () => {
      const cmd = installCommand(createProgram());

      expect(cmd.name()).toBe('install');
      expect(cmd.description()).toBe('Write a commit-msg hook that enforces the message format');
    });
  });

  describe('aliases', () => {
    it('registers alias i', () => {
      const cmd = installCommand(createProgram());

      expect(cmd.aliases()).toEqual(expect.arrayContaining(['i']));
    });
  });

  describe('options', () => {
    it('wires -f / --force with default false', () => {
      const cmd = installCommand(createProgram());
      const forceOpt = cmd.options.find((o) => o.attributeName() === 'force');

      expect(forceOpt).toBeDefined();
      expect(forceOpt!.flags).toBe('-f, --force');
      expect(forceOpt!.description).toBe('Replace an existing commit-msg hook');
      expect(forceOpt!.defaultValue).toBe(false);
    });
  });

  describe('action', () => {
    it('invokes runInstall when parsed', () => {
      const program = createProgram();
      registerCli(program, [commitDef]);

      program.parse(['commit', 'install'], { from: 'user' });

      expect(runInstallMock).toHaveBeenCalledTimes(1);
      expect(runInstallMock).toHaveBeenCalledWith({ force: false });
    });

    it('passes force true when --force is set', () => {
      const program = createProgram();
      registerCli(program, [commitDef]);

      program.parse(['commit', 'install', '--force'], { from: 'user' });

      expect(runInstallMock).toHaveBeenCalledWith({ force: true });
    });

    it('accepts short flag -f', () => {
      const program = createProgram();
      registerCli(program, [commitDef]);

      program.parse(['commit', 'install', '-f'], { from: 'user' });

      expect(runInstallMock).toHaveBeenCalledWith({ force: true });
    });
  });

  describe('subcommands', () => {
    it('has no further nesting', () => {
      const cmd = installCommand(createProgram());

      expect(cmd.commands).toHaveLength(0);
    });
  });
});
