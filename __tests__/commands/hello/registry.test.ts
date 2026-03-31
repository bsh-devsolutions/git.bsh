/**
 * Ensures the hello command is registered when wiring the real CLI list.
 * Hello cmd is just for demo, this should be added to other cmds's tests.
 */
/*import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import registerCli from '@lib/cli';

import commands from '@commands';

function createProgram(): Command {
  const program = new Command();
  program.exitOverride();
  return program;
}

describe('CLI command registry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers hello from the shared commands module', () => {
    const program = createProgram();
    registerCli(program, commands);

    const hello = program.commands.find((c) => c.name() === 'hello');
    expect(hello).toBeDefined();
  });
});*/
