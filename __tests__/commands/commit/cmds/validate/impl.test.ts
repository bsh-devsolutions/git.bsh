/**
 * Unit-test `runValidate`: mock `@lib/logger`.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const { logger } = await import('@lib/logger');
import { runValidate } from '@src/commands/commit/cmds/validate/impl';

const loggerMock = vi.mocked(logger);

describe('runValidate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs that validate was invoked', () => {
    runValidate();

    expect(loggerMock.info).toHaveBeenCalledWith('validate command invoked');
  });
});
