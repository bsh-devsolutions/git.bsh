import { describe, it, expect, vi } from 'vitest';
import { Command } from 'commander';
import registerCli from '@lib/cli';
import type { CommandDefinition } from '@definition';
import { BshError } from '@lib/errors';

function createProgram(): Command {
  const program = new Command();
  program.exitOverride();
  return program;
}

describe('registerCli', () => {
  it('registers each top-level command with name, description, and summary', () => {
    const program = createProgram();
    const defs: CommandDefinition[] = [
      {
        name: 'hello',
        description: 'Say hello',
        summary: 'short greet',
        action: vi.fn(),
      },
      {
        name: 'status',
        description: 'Show status',
        action: vi.fn(),
      },
    ];

    registerCli(program, defs);

    expect(program.commands).toHaveLength(2);
    const [hello, status] = program.commands;
    expect(hello.name()).toBe('hello');
    expect(hello.description()).toBe('Say hello');
    expect(hello.summary()).toBe('short greet');
    expect(status.name()).toBe('status');
    expect(status.description()).toBe('Show status');
    expect(status.summary()).toBe('');
  });

  it('registers aliases on Commander', () => {
    const program = createProgram();
    registerCli(program, [
      {
        name: 'status',
        description: 'Show status',
        aliases: ['st', 'stat'],
        action: vi.fn(),
      },
    ]);

    expect(program.commands[0].aliases()).toEqual(expect.arrayContaining(['st', 'stat']));
  });

  it('registers subcommands under the parent and omits parent action', () => {
    const program = createProgram();
    const install: CommandDefinition = {
      name: 'install',
      description: 'Install hook',
      action: vi.fn(),
    };
    registerCli(program, [
      {
        name: 'commit',
        description: 'Commit helpers',
        subcommands: [install],
      },
    ]);

    expect(program.commands).toHaveLength(1);
    const parent = program.commands[0];
    expect(parent.name()).toBe('commit');
    expect(parent.commands).toHaveLength(1);
    const nested = parent.commands[0];
    expect(nested.name()).toBe('install');
    expect(nested.description()).toBe('Install hook');
  });

  it('parses into the registered subcommand and invokes its action with options', () => {
    const program = createProgram();
    const subAction = vi.fn();
    registerCli(program, [
      {
        name: 'commit',
        description: 'Commit helpers',
        subcommands: [
          {
            name: 'install',
            description: 'Install hook',
            options: [{ flags: '-f, --force', description: 'Force install' }],
            action: subAction,
          },
        ],
      },
    ]);

    program.parse(['commit', 'install', '--force'], { from: 'user' });

    expect(subAction).toHaveBeenCalledTimes(1);
    expect(subAction.mock.calls[0][0]).toMatchObject({ force: true });
  });

  it('invokes a top-level action when the command is parsed', () => {
    const program = createProgram();
    const action = vi.fn();
    registerCli(program, [
      {
        name: 'init',
        description: 'Initialize',
        action,
      },
    ]);

    program.parse(['init'], { from: 'user' });

    expect(action).toHaveBeenCalled();
  });

  it('throws BshError when a command has neither action nor subcommands', () => {
    const program = createProgram();
    expect(() =>
      registerCli(program, [
        {
          name: 'orphan',
          description: 'Broken',
        } as CommandDefinition,
      ]),
    ).toThrow(BshError);
  });
});
