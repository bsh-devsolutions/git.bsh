/**
 * Ensures commands exported from `src/commands/index.ts` register on the shared CLI.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import registerCli from '@lib/cli';

import commands from '@commands';
import type { CommandDefinition } from '@definition';

function createProgram(): Command {
  const program = new Command();
  program.exitOverride();
  return program;
}

function collectDefinedCommandPaths(
  definitions: CommandDefinition[],
  prefix: string[] = [],
): string[] {
  return definitions.flatMap((definition) => {
    const currentPath = [...prefix, definition.name];
    const current = currentPath.join(' ');
    const nested = definition.subcommands
      ? collectDefinedCommandPaths(definition.subcommands, currentPath)
      : [];
    return [current, ...nested];
  });
}

function collectRegisteredCommandPaths(
  parent: Command,
  prefix: string[] = [],
): string[] {
  return parent.commands.flatMap((command) => {
    const currentPath = [...prefix, command.name()];
    const current = currentPath.join(' ');
    const nested = collectRegisteredCommandPaths(command, currentPath);
    return [current, ...nested];
  });
}

describe('CLI command registry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers every command defined in the shared commands module', () => {
    const program = createProgram();
    registerCli(program, commands);

    const expectedPaths = collectDefinedCommandPaths(commands).sort();
    const registeredPaths = collectRegisteredCommandPaths(program).sort();

    expect(registeredPaths).toEqual(expectedPaths);
  });
});
