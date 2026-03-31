/**
 * Unit-test the command implementation: mock `@lib/logger` and `fs`, import and call `runInit`.
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

const { existsSync, writeFileSync, mkdirSync } = vi.hoisted(() => ({
  existsSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

vi.mock('fs', () => ({
  existsSync,
  writeFileSync,
  mkdirSync,
}));

vi.mock('@src/config', () => ({
  defaultConfig: { demo: true },
}));

const { logger } = await import('@lib/logger');
import { runInit } from '@src/commands/init/impl';

const loggerMock = vi.mocked(logger);

describe('runInit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates config dir and file when config is missing', () => {
    existsSync.mockReturnValue(false);

    runInit();

    expect(mkdirSync).toHaveBeenCalledWith('.github', { recursive: true });
    expect(writeFileSync).toHaveBeenCalledWith(
      '.github/bsh.json',
      JSON.stringify({ demo: true }, null, 2),
      { encoding: 'utf-8' },
    );
    expect(loggerMock.info).toHaveBeenCalledWith('Config file created');
  });

  it('does nothing when config already exists', () => {
    existsSync.mockReturnValue(true);

    runInit();

    expect(mkdirSync).not.toHaveBeenCalled();
    expect(writeFileSync).not.toHaveBeenCalled();
    expect(loggerMock.info).not.toHaveBeenCalled();
  });
});
