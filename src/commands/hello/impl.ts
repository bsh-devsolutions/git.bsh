import { logger } from '@lib/logger';

import type { HelloOptions } from './types.js';


export function runHello(options: HelloOptions): void {
  logger.debug(`command invoked: ${options.name}`);
  logger.info(`emitting greeting: ${options.name}`);
  logger.warn(`emitting warning: ${options.name}`);
  logger.error(`emitting error: ${options.name}`);
}
