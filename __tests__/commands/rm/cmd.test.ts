/**
 * Test Commander wiring for `cmd.ts`: mock `./impl.js` so parsing does not hit real side effects,
 * then `registerCli(program, [commandDef])` and `program.parse(...)`.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import registerCli from '@lib/cli';

vi.mock('@src/commands/rm/impl.js', () => ({
  runRm: vi.fn(),
}));

import rmDef from '@commands/rm';
import { runRm } from '@src/commands/rm/impl.js';

const runRmMock = vi.mocked(runRm);

function createProgram(): Command {
  const program = new Command();
  program.exitOverride();
  return program;
}

function registeredRmCommand(program: Command): Command {
  registerCli(program, [rmDef]);
  expect(program.commands).toHaveLength(1);
  return program.commands[0];
}

describe('rm command (cmd)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('metadata', () => {
    it('registers name, description, and summary', () => {
      const cmd = registeredRmCommand(createProgram());

      expect(cmd.name()).toBe('rm');
      expect(cmd.description()).toBe('Remove CLI config from this project');
      expect(cmd.summary()).toBe('Undo init by removing project config');
    });
  });

  describe('aliases', () => {
    it('registers no aliases (definition omits aliases)', () => {
      const cmd = registeredRmCommand(createProgram());

      expect(cmd.aliases()).toEqual([]);
    });
  });

  describe('options', () => {
    it('defines no custom options', () => {
      const cmd = registeredRmCommand(createProgram());

      expect(cmd.options).toHaveLength(0);
    });
  });

  describe('action', () => {
    it('invokes runRm once when the command is parsed', () => {
      const program = createProgram();
      registerCli(program, [rmDef]);

      program.parse(['rm'], { from: 'user' });

      expect(runRmMock).toHaveBeenCalledTimes(1);
    });

    it('calls runRm with no arguments', () => {
      const program = createProgram();
      registerCli(program, [rmDef]);

      program.parse(['rm'], { from: 'user' });

      expect(runRmMock).toHaveBeenCalledWith();
    });
  });

  describe('subcommands', () => {
    it('has no nested commands', () => {
      const cmd = registeredRmCommand(createProgram());

      expect(cmd.commands).toHaveLength(0);
    });
  });
});
