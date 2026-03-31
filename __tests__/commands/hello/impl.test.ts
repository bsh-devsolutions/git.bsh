/**
 * Unit-test the command implementation: mock `@lib/logger`, import and call `run*` from `impl`.
 * Copy this pattern for other commands’ `impl.ts` files.
 * Hello cmd is just for demo, this should be added to other cmds's tests.
 */
/*import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const { logger } = await import('@lib/logger');
import { runHello } from '@src/commands/hello/impl';

const loggerMock = vi.mocked(logger);

describe('runHello', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs at all levels with the given name', () => {
    runHello({ name: 'Ada' });

    expect(loggerMock.debug).toHaveBeenCalledWith('command invoked: Ada');
    expect(loggerMock.info).toHaveBeenCalledWith('emitting greeting: Ada');
    expect(loggerMock.warn).toHaveBeenCalledWith('emitting warning: Ada');
    expect(loggerMock.error).toHaveBeenCalledWith('emitting error: Ada');
  });
});
*/