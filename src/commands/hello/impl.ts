import { logger } from '@src/lib/logger';

import type { HelloOptions } from './types.js';

const log = logger('hello');

export function runHello(options: HelloOptions): void {
  log.debug(`command invoked: ${options.name}`);
  log.info(`emitting greeting: ${options.name}`);
  log.warn(`emitting warning: ${options.name}`);
  log.error(`emitting error: ${options.name}`);
}
