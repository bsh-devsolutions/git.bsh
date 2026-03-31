/**
 * Unit-test `runInstall`: mock git, `fs`, and `@lib/logger`.
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

const { existsSync, writeFileSync, chmodSync } = vi.hoisted(() => ({
  existsSync: vi.fn(),
  writeFileSync: vi.fn(),
  chmodSync: vi.fn(),
}));

vi.mock('fs', () => ({
  existsSync,
  writeFileSync,
  chmodSync,
}));

const { logger } = await import('@lib/logger');
import { runInstall } from '@src/commands/commit/cmds/install/impl';

const loggerMock = vi.mocked(logger);

describe('runInstall', () => {
  const prevEnv = process.env.ENV;

  beforeEach(() => {
    vi.clearAllMocks();
    process.exitCode = 0;
    delete process.env.ENV;
    execSync.mockReturnValue('.git/hooks' as never);
  });

  afterEach(() => {
    if (prevEnv === undefined) delete process.env.ENV;
    else process.env.ENV = prevEnv;
    process.exitCode = 0;
  });

  it('writes hook and chmod when path is free', () => {
    existsSync.mockReturnValue(false);

    runInstall({ force: false });

    expect(writeFileSync).toHaveBeenCalledWith(
      '.git/hooks/commit-msg.bsh',
      expect.stringContaining('npx @bshsolutions/git'),
      { encoding: 'utf8' },
    );
    expect(chmodSync).toHaveBeenCalledWith('.git/hooks/commit-msg.bsh', 0o755);
    expect(loggerMock.info).toHaveBeenCalledWith(
      'Installed commit-msg.bsh hook at .git/hooks/commit-msg.bsh',
    );
  });

  it('uses npm invoker when ENV is local', () => {
    process.env.ENV = 'local';
    existsSync.mockReturnValue(false);

    runInstall({ force: false });

    expect(writeFileSync).toHaveBeenCalledWith(
      '.git/hooks/commit-msg.bsh',
      expect.stringContaining('npm run cli --'),
      { encoding: 'utf8' },
    );
  });

  it('refuses to overwrite without force when hook exists', () => {
    existsSync.mockReturnValue(true);

    runInstall({ force: false });

    expect(writeFileSync).not.toHaveBeenCalled();
    expect(loggerMock.error).toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });

  it('overwrites when hook exists and force is true', () => {
    existsSync.mockReturnValue(true);

    runInstall({ force: true });

    expect(writeFileSync).toHaveBeenCalled();
    expect(loggerMock.info).toHaveBeenCalled();
    expect(process.exitCode).toBe(0);
  });
});
