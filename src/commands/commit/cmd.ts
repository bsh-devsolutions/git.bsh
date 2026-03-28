import type { CommandDefinition } from '@definition';

import installSubcommand from './cmds/install/cmd.js';
import uninstallSubcommand from './cmds/uninstall/cmd.js';
import validateSubcommand from './cmds/validate/cmd.js';

export default {
  name: 'commit',
  aliases: ['c'],
  description: 'Structured commit messages: `<type> (scope): msg`',
  summary: 'Validate commits and manage the commit-msg hook',
  subcommands: [
    installSubcommand,
    uninstallSubcommand,
    validateSubcommand
  ],
} satisfies CommandDefinition;
