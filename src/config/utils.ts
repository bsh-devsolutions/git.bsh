import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { consts } from './consts';
import type { Config } from './type';

export const defaultConfig: Config = {
  logger: {
    level: 'info',
    file: {
      enable: false,
      path: 'logs/bsh-git.log',
    },
  },
};

export async function loadFromFile(): Promise<Config> {
  const path = resolve(process.cwd(), consts.configRelativePath);
  try {
    const text = await readFile(path, 'utf8');
    return mergeConfig(JSON.parse(text) as unknown);
  } catch (err) {
    if (getNodeErrno(err) === 'ENOENT') return structuredClone(defaultConfig);
    throw err;
  }
}

export function mergeConfig(raw: unknown): Config {
  if (!raw || typeof raw !== 'object') {
    return structuredClone(defaultConfig);
  }
  const o = raw as Record<string, unknown>;
  const logger =
    o.logger && typeof o.logger === 'object'
      ? (o.logger as Record<string, unknown>)
      : {};
  const file =
    logger.file && typeof logger.file === 'object'
      ? (logger.file as Record<string, unknown>)
      : {};
  return {
    logger: {
      level: logger.level === 'debug' ? 'debug' : 'info',
      file: {
        enable:
          typeof file.enable === 'boolean'
            ? file.enable
            : defaultConfig.logger.file.enable,
        path:
          typeof file.path === 'string'
            ? file.path
            : defaultConfig.logger.file.path,
      },
    },
  };
}

export function getNodeErrno(err: unknown): NodeJS.ErrnoException['code'] {
  if (!err || typeof err !== 'object' || !('code' in err)) return undefined;
  const code = (err as NodeJS.ErrnoException).code;
  return code;
}
