import { existsSync, readFileSync } from 'fs';
import { getConfig } from '@config';
import { logger } from '@lib/logger';

type Token = 'type' | 'scope' | 'message';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function tokenPattern(token: Token): string {
  if (token === 'type') return '([^\\s(){}:]+)';
  if (token === 'scope') return '([^()\\r\\n]+)';
  return '(.+)';
}

function compileFormat(format: string): { regex: RegExp; tokens: Token[] } {
  const tokenRegex = /\{(type|scope|message)\}/g;
  const tokens: Token[] = [];
  let pattern = '^';
  let lastIdx = 0;

  for (let match = tokenRegex.exec(format); match !== null; match = tokenRegex.exec(format)) {
    const [fullMatch, token] = match;
    const start = match.index;

    pattern += escapeRegex(format.slice(lastIdx, start));
    pattern += tokenPattern(token as Token);
    tokens.push(token as Token);
    lastIdx = start + fullMatch.length;
  }

  pattern += escapeRegex(format.slice(lastIdx));
  pattern += '$';

  return { regex: new RegExp(pattern), tokens };
}

function readCommitMessage(input?: string): string {
  if (!input) return '';
  if (!existsSync(input)) return input;
  return readFileSync(input, 'utf8');
}

function headerFromMessage(message: string): string {
  const lines = message.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    return line;
  }
  return '';
}

export default (input?: string): void => {
  const messageConfig = getConfig().commit.message;
  const message = readCommitMessage(input);
  const header = headerFromMessage(message);

  if (!header.trim()) {
    process.exitCode = 1;
    logger.error('Commit message is empty.');
    return;
  }

  const { regex, tokens } = compileFormat(messageConfig.format);
  const match = regex.exec(header);

  if (!match) {
    process.exitCode = 1;
    logger.error(`Invalid commit message format. Expected: "${messageConfig.format}"`);
    return;
  }

  const extracted: Partial<Record<Token, string>> = {};
  for (let i = 0; i < tokens.length; i += 1) {
    extracted[tokens[i]] = match[i + 1];
  }

  const type = extracted.type?.trim();
  const scope = extracted.scope?.trim();
  const body = extracted.message?.trim();

  if (type && messageConfig.types.length > 0 && !messageConfig.types.includes(type)) {
    process.exitCode = 1;
    logger.error(`Invalid commit type "${type}". Allowed: ${messageConfig.types.join(', ')}`);
    return;
  }

  if (scope && messageConfig.scopes.length > 0 && !messageConfig.scopes.includes(scope)) {
    process.exitCode = 1;
    logger.error(`Invalid commit scope "${scope}". Allowed: ${messageConfig.scopes.join(', ')}`);
    return;
  }

  if (tokens.includes('message') && (!body || body.length === 0)) {
    process.exitCode = 1;
    logger.error('Commit message body cannot be empty.');
    return;
  }
}
