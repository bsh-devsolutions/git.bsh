import { CommanderError, type Command } from 'commander';

import { BshError } from '@errors';
import { logger } from '@logger';


function logMessageFor(err: unknown): string {
  if (err instanceof BshError) return `[${err.code}] ${err.message}`;
  if (err instanceof Error) return err.message;
  return 'command failed';
}

export async function parseWithGlobalErrorHandling(
  program: Command,
  argv: string[] = process.argv,
): Promise<void> {
  program.exitOverride();
  try {
    await program.parseAsync(argv);
  } catch (err) {
    if (err instanceof CommanderError && err.exitCode === 0) {
      process.exit(0);
      return;
    }
    if (err instanceof BshError) {
      logger.error(logMessageFor(err));
      process.exit(err.code);
      return;
    }
    logger.error({ err }, logMessageFor(err));
    process.exit(err instanceof CommanderError ? err.exitCode : 1);
  }
}
