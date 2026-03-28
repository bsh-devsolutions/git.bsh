import { mkdirSync } from 'fs';
import { dirname, resolve as resolvePath } from 'path';

import pino, { type Logger, type LoggerOptions } from 'pino';
import pinoPretty from 'pino-pretty';

function resolveLevel(): LoggerOptions['level'] {
  const raw =
    process.env.LOG_LEVEL ?? process.env.BSH_LOG_LEVEL ?? 'info';
  const normalized = raw.toLowerCase() as NonNullable<LoggerOptions['level']>;
  return normalized;
}

function resolveLogFilePath(): string | undefined {
  const raw = process.env.BSH_LOG_FILE ?? process.env.LOG_FILE ?? 'logs/bsh-git.log';
  if (!raw?.trim()) return undefined;
  return resolvePath(raw.trim());
}

const PRETTY_BASE = {
  translateTime: "SYS:yyyy-mm-dd'T'HH:MM:ss.l",
  ignore: 'pid,hostname',
  singleLine: true,
  messageFormat: '{msg}',
} as const;

function createPrettyDestination(
  destination: string | number,
  opts: { colorize: boolean; mkdir?: boolean },
) {
  return pinoPretty({
    ...PRETTY_BASE,
    colorize: opts.colorize,
    destination,
    ...(opts.mkdir ? { mkdir: true as const } : {}),
  });
}

function createDestination() {
  const logFile = resolveLogFilePath();

  if (process.stdout.isTTY) {
    const consoleDest = createPrettyDestination(1, { colorize: true });
    if (!logFile) return consoleDest;

    const fileDest = createPrettyDestination(logFile, {
      colorize: false,
      mkdir: true,
    });
    return pino.multistream([
      { level: resolveLevel(), stream: consoleDest },
      { level: resolveLevel(), stream: fileDest },
    ]);
  }

  const consoleDest = pino.destination(1);
  if (!logFile) return consoleDest;

  mkdirSync(dirname(logFile), { recursive: true });
  const fileDest = pino.destination(logFile);
  return pino.multistream([
    { level: resolveLevel(), stream: consoleDest },
    { level: resolveLevel(), stream: fileDest },
  ]);
}

const baseOptions: LoggerOptions = {
  level: resolveLevel(),
  name: 'bsh-git',
  redact: {
    paths: [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'authorization',
      'cookie',
      'cookies',
      'set-cookie',
      '*.password',
      '*.token',
      '*.authorization',
    ],
    censor: '[redacted]',
  },
};

export function logger(name?: string): Logger {
  const log = pino(baseOptions, createDestination());
  if (name) {
    return log.child({ name: name });
  }
  return log;
}

export type { Logger, LoggerOptions } from 'pino';
