import { defaultConfig } from '@src/config';
import { logger } from '@lib/logger';

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

const CONFIG_DIR = '.github';
const CONFIG_FILE = 'bsh.json';
const CONFIG_PATH = join(CONFIG_DIR, CONFIG_FILE);

export function runInit(): void {
  if (!existsSync(CONFIG_PATH)) {
    mkdirSync(dirname(CONFIG_PATH), { recursive: true });
    writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2), { encoding: 'utf-8' });
    logger.info('Config file created');
  }
}
