import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

vi.mock('@config', () => ({
  getConfig: vi.fn(),
}));

const { existsSync, readFileSync } = vi.hoisted(() => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

vi.mock('fs', () => ({
  existsSync,
  readFileSync,
}));

const { logger } = await import('@lib/logger');
const { getConfig } = await import('@config');
import runValidate from '@src/commands/commit/cmds/msg/cmds/validate/impl';

const loggerMock = vi.mocked(logger);
const getConfigMock = vi.mocked(getConfig);
const existsSyncMock = vi.mocked(existsSync);
const readFileSyncMock = vi.mocked(readFileSync);

describe('commit msg validate implementation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.exitCode = undefined;
    existsSyncMock.mockReturnValue(false);
    getConfigMock.mockReturnValue({
      commit: {
        message: {
          format: '{type}({scope}): {message}',
          types: ['feat', 'fix'],
          scopes: ['core', 'cli'],
        },
      },
    } as never);
  });

  it('fails when input is empty', () => {
    runValidate();

    expect(process.exitCode).toBe(1);
    expect(loggerMock.error).toHaveBeenCalledWith('Commit message is empty.');
  });

  it('reads commit message from file input when path exists', () => {
    existsSyncMock.mockReturnValueOnce(true);
    readFileSyncMock.mockReturnValueOnce('feat(core): add tests\n');

    runValidate('/tmp/commit-msg');

    expect(readFileSyncMock).toHaveBeenCalledWith('/tmp/commit-msg', 'utf8');
    expect(loggerMock.error).not.toHaveBeenCalled();
    expect(process.exitCode).toBeUndefined();
  });

  it('fails on invalid format', () => {
    runValidate('this is not conventional');

    expect(process.exitCode).toBe(1);
    expect(loggerMock.error).toHaveBeenCalledWith(
      'Invalid commit message format. Expected: "{type}({scope}): {message}"',
    );
  });

  it('fails when type is outside allowed set', () => {
    runValidate('chore(core): housekeeping');

    expect(process.exitCode).toBe(1);
    expect(loggerMock.error).toHaveBeenCalledWith('Invalid commit type "chore". Allowed: feat, fix');
  });

  it('fails when scope is outside allowed set', () => {
    runValidate('feat(api): add endpoint');

    expect(process.exitCode).toBe(1);
    expect(loggerMock.error).toHaveBeenCalledWith('Invalid commit scope "api". Allowed: core, cli');
  });
});
