import { mkdirSync } from 'fs';
import { dirname, resolve as resolvePath } from 'path';

import pino, { type Logger, type LoggerOptions } from 'pino';
import pinoPretty from 'pino-pretty';

import { getConfig } from '@config';

import { BshError } from '@lib/errors';

const loggerConfig = () => getConfig().logger
const level = (): LoggerOptions['level'] => loggerConfig().level

function resolveLogFilePath(): string | undefined {
  const { file } = loggerConfig();
  if (!file.enable || !file.path.trim()) return undefined;
  return resolvePath(file.path.trim());
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
    sync: true,
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
      { level: level(), stream: consoleDest },
      { level: level(), stream: fileDest },
    ]);
  }

  const consoleDest = pino.destination({ dest: 1, sync: true, minLength: 0 });
  if (!logFile) return consoleDest;

  mkdirSync(dirname(logFile), { recursive: true });
  const fileDest = pino.destination({
    dest: logFile,
    sync: true,
    mkdir: true,
    minLength: 0,
  });
  return pino.multistream([
    { level: level(), stream: consoleDest },
    { level: level(), stream: fileDest },
  ]);
}

function serializeErr(err: Error): Record<string, unknown> {
  const base = pino.stdSerializers.err(err) as Record<string, unknown>;
  if (err instanceof BshError) {
    return {
      ...base,
      code: err.code,
      ...(err.context !== undefined && { context: err.context }),
    };
  }
  return base;
}

function buildBaseOptions(): LoggerOptions {
  return {
    level: level(),
    serializers: {
      err: serializeErr,
    },
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
}

let rootLogger: Logger | undefined;

function getRootLogger(): Logger {
  if (!rootLogger) {
    rootLogger = pino(buildBaseOptions(), createDestination());
  }
  return rootLogger;
}

export function Logger(name?: string): Logger {
  const root = getRootLogger();
  return name ? root.child({ name }) : root;
}

export const logger = new Proxy({} as Logger, {
  get(_target, prop) {
    const inst = getRootLogger();
    const value = (inst as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === 'function' ? value.bind(inst) : value;
  },
});
