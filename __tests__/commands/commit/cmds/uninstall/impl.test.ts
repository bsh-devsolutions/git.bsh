/**
 * Unit-test `runUninstall`: mock git, `fs`, and `@lib/logger`.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const { execSync } = vi.hoisted(() => ({
  execSync: vi.fn(() => '.git/hooks'),
}));

vi.mock('child_process', () => ({
  execSync,
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

const { logger } = await import('@lib/logger');
import { runUninstall } from '@src/commands/commit/cmds/uninstall/impl';

const loggerMock = vi.mocked(logger);

describe('runUninstall', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.exitCode = 0;
    execSync.mockReturnValue('.git/hooks' as never);
  });

  afterEach(() => {
    process.exitCode = 0;
  });

  it('logs and returns when hook file is missing', () => {
    existsSync.mockReturnValue(false);

    runUninstall({ force: false });

    expect(readFileSync).not.toHaveBeenCalled();
    expect(unlinkSync).not.toHaveBeenCalled();
    expect(loggerMock.info).toHaveBeenCalledWith(
      'No commit-msg.bsh hook at .git/hooks/commit-msg.bsh.',
    );
  });

  it('removes hook when contents look like ours', () => {
    existsSync.mockReturnValue(true);
    readFileSync.mockReturnValue('#!/bin/sh\nnpx @bshsolutions/git commit validate "$1"\n');

    runUninstall({ force: false });

    expect(unlinkSync).toHaveBeenCalledWith('.git/hooks/commit-msg.bsh');
    expect(loggerMock.info).toHaveBeenCalledWith(
      'Removed commit-msg.bsh hook at .git/hooks/commit-msg.bsh',
    );
  });

  it('refuses foreign hook without force', () => {
    existsSync.mockReturnValue(true);
    readFileSync.mockReturnValue('#!/bin/sh\necho other\n');

    runUninstall({ force: false });

    expect(unlinkSync).not.toHaveBeenCalled();
    expect(loggerMock.error).toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });

  it('removes foreign hook with force', () => {
    existsSync.mockReturnValue(true);
    readFileSync.mockReturnValue('#!/bin/sh\necho other\n');

    runUninstall({ force: true });

    expect(unlinkSync).toHaveBeenCalledWith('.git/hooks/commit-msg.bsh');
  });
});
