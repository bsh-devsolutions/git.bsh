/**
 * Commander wiring for `commit uninstall`.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import registerCli from '@lib/cli';

vi.mock('@src/commands/commit/cmds/uninstall/impl.js', () => ({
  runUninstall: vi.fn(),
}));

import commitDef from '@commands/commit';
import { runUninstall } from '@src/commands/commit/cmds/uninstall/impl.js';

const runUninstallMock = vi.mocked(runUninstall);

function createProgram(): Command {
  const program = new Command();
  program.exitOverride();
  return program;
}

function uninstallCommand(program: Command): Command {
  registerCli(program, [commitDef]);
  const commit = program.commands[0];
  const nested = commit.commands.find((c) => c.name() === 'uninstall');
  expect(nested).toBeDefined();
  return nested!;
}

describe('commit uninstall (cmd)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('metadata', () => {
    it('registers name and description', () => {
      const cmd = uninstallCommand(createProgram());

      expect(cmd.name()).toBe('uninstall');
      expect(cmd.description()).toBe('Remove the commit-msg hook installed by install');
    });
  });

  describe('aliases', () => {
    it('registers alias ui', () => {
      const cmd = uninstallCommand(createProgram());

      expect(cmd.aliases()).toEqual(expect.arrayContaining(['ui']));
    });
  });

  describe('options', () => {
    it('wires -f / --force with default false', () => {
      const cmd = uninstallCommand(createProgram());
      const forceOpt = cmd.options.find((o) => o.attributeName() === 'force');

      expect(forceOpt).toBeDefined();
      expect(forceOpt!.flags).toBe('-f, --force');
      expect(forceOpt!.description).toBe(
        'Remove the hook even if it was not installed by this tool',
      );
      expect(forceOpt!.defaultValue).toBe(false);
    });
  });

  describe('action', () => {
    it('invokes runUninstall when parsed', () => {
      const program = createProgram();
      registerCli(program, [commitDef]);

      program.parse(['commit', 'uninstall'], { from: 'user' });

      expect(runUninstallMock).toHaveBeenCalledTimes(1);
      expect(runUninstallMock).toHaveBeenCalledWith({ force: false });
    });

    it('passes force true with --force', () => {
      const program = createProgram();
      registerCli(program, [commitDef]);

      program.parse(['commit', 'uninstall', '--force'], { from: 'user' });

      expect(runUninstallMock).toHaveBeenCalledWith({ force: true });
    });
  });

  describe('subcommands', () => {
    it('has no nested commands', () => {
      const cmd = uninstallCommand(createProgram());

      expect(cmd.commands).toHaveLength(0);
    });
  });
});
