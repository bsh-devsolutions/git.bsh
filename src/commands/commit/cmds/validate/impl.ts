import { logger } from '@src/lib/logger';

const log = logger('commit');

export function runValidate(): void {
  log.info('validate command invoked');
}
