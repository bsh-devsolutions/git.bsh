/**
 * Ensures commands exported from `src/commands/index.ts` register on the shared CLI.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import registerCli from '@lib/cli';

import commands from '@commands';

vi.mock('@src/commands/init/impl.js', () => ({ runInit: vi.fn() }));
vi.mock('@src/commands/rm/impl.js', () => ({ runRm: vi.fn() }));
vi.mock('@src/commands/commit/cmds/install/impl.js', () => ({ runInstall: vi.fn() }));
vi.mock('@src/commands/commit/cmds/validate/impl.js', () => ({ runValidate: vi.fn() }));
vi.mock('@src/commands/commit/cmds/uninstall/impl.js', () => ({ runUninstall: vi.fn() }));

function createProgram(): Command {
  const program = new Command();
  program.exitOverride();
  return program;
}

describe('CLI command registry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers init, rm, and commit from the shared commands module', () => {
    const program = createProgram();
    registerCli(program, commands);

    const names = program.commands.map((c) => c.name()).sort();
    expect(names).toEqual(['commit', 'init', 'rm']);
  });
});
