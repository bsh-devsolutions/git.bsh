import { Command } from 'commander';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import commands from '@commands';
import { BshError } from '@errors';
import { parseWithGlobalErrorHandling } from '@middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8'),
);

const program = new Command();

program
  .name('git.bsh')
  .description('Git workflows with a simpler interface')
  .version(packageJson.version);

commands.forEach((cmd) => {
  const sub = program
    .command(cmd.name)
    .description(cmd.description)
    .summary(cmd.summary);

  for (const a of cmd.aliases ?? []) {
    sub.alias(a);
  }

  if (cmd.options) {
    for (const opt of cmd.options) {
      if (opt.defaultValue !== undefined) {
        sub.option(opt.flags, opt.description, opt.defaultValue);
      } else {
        sub.option(opt.flags, opt.description);
      }
    }
  }

  if (cmd.subcommands?.length) {
    for (const sc of cmd.subcommands) {
      const nested = sub.command(sc.name).description(sc.description);
      for (const a of sc.aliases ?? []) {
        nested.alias(a);
      }
      if (sc.options) {
        for (const opt of sc.options) {
          if (opt.defaultValue !== undefined) {
            nested.option(opt.flags, opt.description, opt.defaultValue);
          } else {
            nested.option(opt.flags, opt.description);
          }
        }
      }
      nested.action((...actionArgs: unknown[]) => {
        const options = actionArgs[actionArgs.length - 2] as Record<
          string,
          unknown
        >;
        const positionals = actionArgs.slice(0, -2) as string[];
        sc.action(options as never, ...positionals);
      });
    }
  } else if (cmd.action) {
    sub.action(cmd.action);
  } else {
    throw new BshError(
      500,
      `Command "${cmd.name}" must define action or subcommands`,
    );
  }
});

void parseWithGlobalErrorHandling(program);
