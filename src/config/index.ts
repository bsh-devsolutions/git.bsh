import type { Config } from './type';   
import { loadFromFile } from './utils';

let instance: Config | undefined;
let initPromise: Promise<Config> | undefined;

export async function initConfig(): Promise<Config> {
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
  if (!instance) {
    throw new Error('Config not initialized; call initConfig() before use');
  }
  return instance;
}

export { Config };
