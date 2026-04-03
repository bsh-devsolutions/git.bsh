import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

const { existsSync, readFileSync, unlinkSync } = vi.hoisted(() => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  unlinkSync: vi.fn(),
}));

vi.mock('fs', () => ({
  existsSync,
  readFileSync,
  unlinkSync,
}));

vi.mock('@src/commands/commit/cmds/msg/cmds/install/utils.js', () => ({
  gitHooksDir: vi.fn(),
  messageFormatScript: '#!/bin/sh\nnpx @bshsolutions/git commit msg validate "$1"\n',
}));

const { logger } = await import('@lib/logger');
const { gitHooksDir, messageFormatScript } = await import(
  '@src/commands/commit/cmds/msg/cmds/install/utils.js'
);
import runUninstall from '@src/commands/commit/cmds/msg/cmds/uninstall/impl';

const loggerMock = vi.mocked(logger);
const existsSyncMock = vi.mocked(existsSync);
const readFileSyncMock = vi.mocked(readFileSync);
const unlinkSyncMock = vi.mocked(unlinkSync);
const gitHooksDirMock = vi.mocked(gitHooksDir);

describe('commit msg uninstall implementation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.exitCode = undefined;
    gitHooksDirMock.mockReturnValue('/repo/.git/hooks');
    existsSyncMock.mockReturnValue(true);
    readFileSyncMock.mockReturnValue(messageFormatScript);
  });

  it('logs and exits when hook file does not exist', () => {
    existsSyncMock.mockReturnValue(false);

    runUninstall({ force: false });

    expect(loggerMock.info).toHaveBeenCalledWith(
      'No commit-msg hook found at /repo/.git/hooks/commit-msg',
    );
    expect(unlinkSyncMock).not.toHaveBeenCalled();
    expect(process.exitCode).toBeUndefined();
  });

  it('fails when hook exists but was not installed by this tool', () => {
    readFileSyncMock.mockReturnValue('echo "custom hook"\n');

    runUninstall({ force: false });

    expect(unlinkSyncMock).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
    expect(loggerMock.error).toHaveBeenCalledWith(
      'commit-msg at /repo/.git/hooks/commit-msg was not installed by this tool. Use --force to remove it.',
    );
  });

  it('removes hook when forced even if content does not match', () => {
    readFileSyncMock.mockReturnValue('echo "custom hook"\n');

    runUninstall({ force: true });

    expect(readFileSyncMock).not.toHaveBeenCalled();
    expect(unlinkSyncMock).toHaveBeenCalledWith('/repo/.git/hooks/commit-msg');
    expect(loggerMock.info).toHaveBeenCalledWith('Removed /repo/.git/hooks/commit-msg');
    expect(process.exitCode).toBeUndefined();
  });

  it('fails with exit code when hook cannot be read', () => {
    const e = Object.assign(new Error('cannot read'), { code: 'EACCES' });
    readFileSyncMock.mockImplementation(() => {
      throw e;
    });

    runUninstall({ force: false });

    expect(unlinkSyncMock).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
    expect(loggerMock.error).toHaveBeenCalledWith(
      'Could not read /repo/.git/hooks/commit-msg (EACCES).',
    );
  });
});
