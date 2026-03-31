/**
 * Unit-test `runRm`: mock `fs` and `@lib/logger`.
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

const { unlinkSync, readdirSync, rmdirSync, resolveMock } = vi.hoisted(() => {
  const resolveMock = vi.fn(() => '/proj/.github/bsh.json');
  return {
    unlinkSync: vi.fn(),
    readdirSync: vi.fn(),
    rmdirSync: vi.fn(),
    resolveMock,
  };
});

vi.mock('fs', () => ({
  unlinkSync,
  readdirSync,
  rmdirSync,
}));

vi.mock('path', () => ({
  dirname: (p: string) => p.replace(/\/[^/]+$/, '') || '/proj/.github',
  resolve: (..._args: string[]) => resolveMock(),
}));

const { logger } = await import('@lib/logger');
import { runRm } from '@src/commands/rm/impl';

const loggerMock = vi.mocked(logger);

function enoentError(): NodeJS.ErrnoException {
  const e = new Error('ENOENT') as NodeJS.ErrnoException;
  e.code = 'ENOENT';
  return e;
}

describe('runRm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolveMock.mockReturnValue('/proj/.github/bsh.json');
  });

  it('returns quietly when config file is already missing', () => {
    unlinkSync.mockImplementation(() => {
      throw enoentError();
    });

    runRm();

    expect(readdirSync).not.toHaveBeenCalled();
    expect(rmdirSync).not.toHaveBeenCalled();
    expect(loggerMock.info).not.toHaveBeenCalled();
  });

  it('removes file, empty parent dir, and logs when removal succeeds', () => {
    unlinkSync.mockReturnValue(undefined);
    readdirSync.mockReturnValue([]);

    runRm();

    expect(unlinkSync).toHaveBeenCalledWith('/proj/.github/bsh.json');
    expect(readdirSync).toHaveBeenCalledWith('/proj/.github');
    expect(rmdirSync).toHaveBeenCalledWith('/proj/.github');
    expect(loggerMock.info).toHaveBeenCalledWith('Config file removed');
  });

  it('does not remove parent dir when it is not empty', () => {
    unlinkSync.mockReturnValue(undefined);
    readdirSync.mockReturnValue(['other']);

    runRm();

    expect(rmdirSync).not.toHaveBeenCalled();
    expect(loggerMock.info).toHaveBeenCalledWith('Config file removed');
  });
});
