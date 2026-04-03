import type { Config } from './type';   
import { mkdir, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { consts } from './consts';
import { defaultConfig, getNodeErrno, loadFromFile } from './utils';

let instance: Config | undefined;
let initPromise: Promise<Config> | undefined;

export async function loadConfig(): Promise<Config> {
  if (instance) return instance;
  if (!initPromise) {
    initPromise = loadFromFile().then((c) => {
      instance = c;
      return c;
    });
  }
  return initPromise;
}

export function getConfig(): Config {
  if (!instance) instance = defaultConfig;
  return instance;
}

function configPathFromCwd(): string {
  return resolve(process.cwd(), consts.configRelativePath);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeValue(base: unknown, patch: unknown): unknown {
  if (Array.isArray(base) && Array.isArray(patch)) return [...patch];
  if (isRecord(base) && isRecord(patch)) {
    const result: Record<string, unknown> = { ...base };
    for (const key of Object.keys(base)) {
      if (!Object.prototype.hasOwnProperty.call(patch, key)) continue;
      result[key] = mergeValue(base[key], patch[key]);
    }
    return result;
  }
  return patch === undefined ? base : patch;
}

function mergeIntoConfig(base: Config, patch: unknown): Config {
  return mergeValue(base, patch) as Config;
}

async function writeConfigFile(config: Config): Promise<void> {
  const configPath = configPathFromCwd();
  await mkdir(dirname(configPath), { recursive: true });
  await writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
}

export async function createConfigFileIfNotExists(): Promise<Config> {
  const configPath = configPathFromCwd();
  try {
    await writeFile(configPath, '', { flag: 'wx' });
  } catch (err) {
    const code = getNodeErrno(err);
    if (code !== 'ENOENT' && code !== 'EEXIST') throw err;
    if (code === 'ENOENT') {
      await mkdir(dirname(configPath), { recursive: true });
      await writeFile(configPath, '', { flag: 'wx' });
    }
  }

  const config = await loadFromFile();
  await writeConfigFile(config);
  return config;
}

export async function loadConfigFromFile(): Promise<Config> {
  const config = await loadFromFile();
  instance = config;
  initPromise = Promise.resolve(config);
  return config;
}

export async function overwriteConfigFile(config: Config): Promise<Config> {
  await writeConfigFile(config);
  instance = config;
  initPromise = Promise.resolve(config);
  return config;
}

export async function mergeConfigFile(nextData: unknown): Promise<Config> {
  const current = await loadFromFile();
  const merged = mergeIntoConfig(current, nextData);
  await writeConfigFile(merged);
  instance = merged;
  initPromise = Promise.resolve(merged);
  return merged;
}

export { Config, defaultConfig };
