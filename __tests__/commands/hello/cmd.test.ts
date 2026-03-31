/**
 * Test Commander wiring for `cmd.ts`: mock `./impl.js` so parsing does not hit real side effects,
 * then `registerCli(program, [commandDef])` and `program.parse(...)`.
 * Copy this pattern for other commands’ `cmd.ts` files.
 * Hello cmd is just for demo, this should be added to other cmds's tests.
 */
/*import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import registerCli from '@lib/cli';

vi.mock('@src/commands/hello/impl.js', () => ({
  runHello: vi.fn(),
}));

import helloDef from '@commands/hello';
import { runHello } from '@src/commands/hello/impl.js';

const runHelloMock = vi.mocked(runHello);

function createProgram(): Command {
  const program = new Command();
  program.exitOverride();
  return program;
}

function registeredHelloCommand(program: Command): Command {
  registerCli(program, [helloDef]);
  expect(program.commands).toHaveLength(1);
  return program.commands[0];
}

describe('hello command (cmd)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('metadata', () => {
    it('registers name, description, and summary', () => {
      const cmd = registeredHelloCommand(createProgram());

      expect(cmd.name()).toBe('hello');
      expect(cmd.description()).toBe('Print a greeting');
      expect(cmd.summary()).toBe('Print a greeting');
    });
  });

  describe('aliases', () => {
    it('registers no aliases (definition omits aliases)', () => {
      const cmd = registeredHelloCommand(createProgram());

      expect(cmd.aliases()).toEqual([]);
    });
  });

  describe('options', () => {
    it('wires -n / --name with description and default', () => {
      const cmd = registeredHelloCommand(createProgram());
      const nameOption = cmd.options.find((o) => o.attributeName() === 'name');

      expect(nameOption).toBeDefined();
      expect(nameOption!.flags).toBe('-n, --name <name>');
      expect(nameOption!.description).toBe('Who to greet');
      expect(nameOption!.defaultValue).toBe('World');
    });
  });

  describe('action', () => {
    it('invokes runHello once when the command is parsed', () => {
      const program = createProgram();
      registerCli(program, [helloDef]);

      program.parse(['hello'], { from: 'user' });

      expect(runHelloMock).toHaveBeenCalledTimes(1);
    });

    it('passes default name when --name is omitted', () => {
      const program = createProgram();
      registerCli(program, [helloDef]);

      program.parse(['hello'], { from: 'user' });

      expect(runHelloMock).toHaveBeenCalledWith({ name: 'World' });
    });

    it('passes --name through to runHello', () => {
      const program = createProgram();
      registerCli(program, [helloDef]);

      program.parse(['hello', '--name', 'CLI'], { from: 'user' });

      expect(runHelloMock).toHaveBeenCalledWith({ name: 'CLI' });
    });

    it('accepts short flag -n', () => {
      const program = createProgram();
      registerCli(program, [helloDef]);

      program.parse(['hello', '-n', 'Short'], { from: 'user' });

      expect(runHelloMock).toHaveBeenCalledWith({ name: 'Short' });
    });
  });

  describe('subcommands', () => {
    it('has no nested commands', () => {
      const cmd = registeredHelloCommand(createProgram());

      expect(cmd.commands).toHaveLength(0);
    });
  });
});
*/