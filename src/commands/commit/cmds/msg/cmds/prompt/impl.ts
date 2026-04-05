import { spawnSync } from 'child_process';
import prompts from 'prompts';

import { getConfig } from '@config';
import { BshError } from '@lib/errors';
import { logger } from '@lib/logger';

import {
  type FormatToken,
  buildMessageFromParts,
  formatTokenOrder,
  formatTokenUsage,
} from './format.js';

type PromptOptions = {
  dryRun?: boolean;
  skipVerify?: boolean;
};

const cancelPrompts = {
  onCancel: (): never => {
    process.exit(130);
  },
};

async function chooseFromConfigList(label: string, allowed: string[]): Promise<string> {
  if (allowed.length === 0) {
    const response = await prompts(
      {
        type: 'text',
        name: 'value',
        message: `${label} (not listed in config — type a value)`,
        validate: (value: string) => (value.trim().length > 0 ? true : 'Required'),
      },
      cancelPrompts,
    );
    return String(response.value).trim();
  }

  const response = await prompts(
    {
      type: 'select',
      name: 'value',
      message: label,
      choices: allowed.map((value) => ({ title: value, value })),
      hint: '↑/↓ to move, Enter to select',
    },
    cancelPrompts,
  );

  return String(response.value);
}

async function promptForToken(
  token: FormatToken,
  types: string[],
  scopes: string[],
): Promise<string> {
  if (token === 'type') {
    return chooseFromConfigList('Type', types);
  }
  if (token === 'scope') {
    return chooseFromConfigList('Scope', scopes);
  }

  const response = await prompts(
    {
      type: 'text',
      name: 'value',
      message: 'Message',
      validate: (value: string) => (value.trim().length > 0 ? true : 'Message cannot be empty'),
    },
    cancelPrompts,
  );

  return String(response.value).trim();
}

function assertGitRepo(): void {
  try {
    const r = spawnSync('git', ['rev-parse', '--git-dir'], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    if (r.status !== 0) {
      throw new BshError(404, 'Not a Git repository.');
    }
  } catch (e) {
    if (e instanceof BshError) throw e;
    throw new BshError(404, 'Not a Git repository.');
  }
}

export default async function run(options: PromptOptions = {}): Promise<void> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    process.exitCode = 1;
    logger.error('This command requires an interactive terminal.');
    return;
  }

  const messageConfig = getConfig().commit.message;
  const { format, types, scopes } = messageConfig;
  const order = formatTokenOrder(format);

  if (order.length === 0) {
    process.exitCode = 1;
    logger.error(
      `Commit message format has no placeholders. Add {type}, {scope}, and/or {message} in config. Current format: "${format}"`,
    );
    return;
  }

  const usage = formatTokenUsage(format);
  logger.info('Commit message format (from config):');
  logger.info(`  ${format}`);
  logger.info(
    `  Uses: type ${usage.type ? 'yes' : 'no'}, scope ${usage.scope ? 'yes' : 'no'}, message ${usage.message ? 'yes' : 'no'}`,
  );

  const parts: Partial<Record<FormatToken, string>> = {};
  for (const token of order) {
    parts[token] = await promptForToken(token, types, scopes);
  }

  const header = buildMessageFromParts(format, parts);

  if (options.dryRun) {
    logger.info(header);
    return;
  }

  try {
    assertGitRepo();
  } catch (e) {
    process.exitCode = 1;
    if (e instanceof BshError) {
      logger.error(e.message);
    }
    return;
  }

  logger.info('');
  logger.info('Commit message preview:');
  logger.info(`  ${header}`);
  logger.info('');

  const confirmResponse = await prompts(
    {
      type: 'confirm',
      name: 'proceed',
      message: 'Run git commit with this message?',
      initial: true,
    },
    cancelPrompts,
  );

  if (!confirmResponse.proceed) {
    logger.info('Commit cancelled.');
    return;
  }

  const gitArgs = ['commit', '-m', header];
  if (options.skipVerify) {
    gitArgs.push('--no-verify');
  }

  const result = spawnSync('git', gitArgs, { stdio: 'inherit' });
  if (result.status !== 0 && result.status !== null) {
    process.exitCode = result.status;
  }
}
