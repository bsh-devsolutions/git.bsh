import { Command } from 'commander';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import middleware from '@middleware';
import commands from '@commands';
import cli from '@lib/cli';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8'),
);

const program = new Command();

program
  .name('git')
  .description('Git workflows with a simpler interface')
  .version(packageJson.version);

cli(program, commands);
void middleware(program);
