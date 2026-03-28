import { Command } from 'commander';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import commands from './commands';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8'),
);

const program = new Command();

program
  .name('bsh-git')
  .description('Git workflows with a simpler interface')
  .version(packageJson.version);

commands.forEach((cmd) => {
  // define the subcommand
  const sub = program
    .command(cmd.name)
    .description(cmd.description)
    .summary(cmd.summary);
  
    // define the options
    if (cmd.options) {
    for (const opt of cmd.options) {
      if (opt.defaultValue !== undefined) {
        sub.option(opt.flags, opt.description, opt.defaultValue);
      } else {
        sub.option(opt.flags, opt.description);
      }
    }
  }

  // define the action
  sub.action(cmd.action);
});

program.parse();
