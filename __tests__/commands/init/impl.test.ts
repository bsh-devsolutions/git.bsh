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

const { access } = vi.hoisted(() => ({
  access: vi.fn(),
}));

vi.mock('fs/promises', () => ({
  access,
}));

vi.mock('@src/config', () => ({
  createConfigFileIfNotExists: vi.fn(),
}));

const { createConfigFileIfNotExists } = await import('@src/config');
const { logger } = await import('@lib/logger');
import { runInit } from '@src/commands/init/impl';

const loggerMock = vi.mocked(logger);
const accessMock = vi.mocked(access);
const createConfigFileIfNotExistsMock = vi.mocked(createConfigFileIfNotExists);

describe('runInit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    accessMock.mockResolvedValue(undefined);
    createConfigFileIfNotExistsMock.mockResolvedValue(undefined as never);
  });

  it('creates config when missing and logs creation', async () => {
    accessMock.mockRejectedValueOnce(Object.assign(new Error('missing'), { code: 'ENOENT' }));

    await runInit();

    expect(createConfigFileIfNotExistsMock).toHaveBeenCalledTimes(1);
    expect(loggerMock.info).toHaveBeenCalledWith('Config file created');
  });

  it('does not log when config already exists', async () => {
    accessMock.mockResolvedValueOnce(undefined);

    await runInit();

    expect(createConfigFileIfNotExistsMock).toHaveBeenCalledTimes(1);
    expect(loggerMock.info).not.toHaveBeenCalled();
  });
});
