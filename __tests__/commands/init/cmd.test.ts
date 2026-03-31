/**
 * Test Commander wiring for `cmd.ts`: mock `./impl.js` so parsing does not hit real side effects,
 * then `registerCli(program, [commandDef])` and `program.parse(...)`.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import registerCli from '@lib/cli';

vi.mock('@src/commands/init/impl.js', () => ({
  runInit: vi.fn(),
}));

import initDef from '@commands/init';
import { runInit } from '@src/commands/init/impl.js';

const runInitMock = vi.mocked(runInit);

function createProgram(): Command {
  const program = new Command();
  program.exitOverride();
  return program;
}

function registeredInitCommand(program: Command): Command {
  registerCli(program, [initDef]);
  expect(program.commands).toHaveLength(1);
  return program.commands[0];
}

describe('init command (cmd)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('metadata', () => {
    it('registers name, description, and summary', () => {
      const cmd = registeredInitCommand(createProgram());

      expect(cmd.name()).toBe('init');
      expect(cmd.description()).toBe('Initialize the environment');
      expect(cmd.summary()).toBe('Initialize the environment');
    });
  });

  describe('aliases', () => {
    it('registers no aliases (definition omits aliases)', () => {
      const cmd = registeredInitCommand(createProgram());

      expect(cmd.aliases()).toEqual([]);
    });
  });

  describe('options', () => {
    it('defines no custom options', () => {
      const cmd = registeredInitCommand(createProgram());

      expect(cmd.options).toHaveLength(0);
    });
  });

  describe('action', () => {
    it('invokes runInit once when the command is parsed', () => {
      const program = createProgram();
      registerCli(program, [initDef]);

      program.parse(['init'], { from: 'user' });

      expect(runInitMock).toHaveBeenCalledTimes(1);
    });

    it('calls runInit with no arguments', () => {
      const program = createProgram();
      registerCli(program, [initDef]);

      program.parse(['init'], { from: 'user' });

      expect(runInitMock).toHaveBeenCalledWith();
    });
  });

  describe('subcommands', () => {
    it('has no nested commands', () => {
      const cmd = registeredInitCommand(createProgram());

      expect(cmd.commands).toHaveLength(0);
    });
  });
});
