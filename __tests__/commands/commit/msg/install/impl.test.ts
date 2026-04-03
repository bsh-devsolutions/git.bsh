import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@config', () => ({
  getConfig: vi.fn(),
  mergeConfigFile: vi.fn(),
}));

vi.mock('@src/commands/commit/cmds/msg/cmds/install/utils.js', () => ({
  canOverwriteHook: vi.fn(),
  gitHooksDir: vi.fn(),
  promptMessageConfig: vi.fn(),
  writeHookFile: vi.fn(),
}));

const { logger } = await import('@lib/logger');
const { getConfig, mergeConfigFile } = await import('@config');
const { canOverwriteHook, gitHooksDir, promptMessageConfig, writeHookFile } = await import(
  '@src/commands/commit/cmds/msg/cmds/install/utils.js'
);
import runInstall from '@src/commands/commit/cmds/msg/cmds/install/impl';

const loggerMock = vi.mocked(logger);
const getConfigMock = vi.mocked(getConfig);
const mergeConfigFileMock = vi.mocked(mergeConfigFile);
const canOverwriteHookMock = vi.mocked(canOverwriteHook);
const gitHooksDirMock = vi.mocked(gitHooksDir);
const promptMessageConfigMock = vi.mocked(promptMessageConfig);
const writeHookFileMock = vi.mocked(writeHookFile);

describe('commit msg install implementation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.exitCode = undefined;

    gitHooksDirMock.mockReturnValue('/repo/.git/hooks');
    canOverwriteHookMock.mockReturnValue(true);
    getConfigMock.mockReturnValue({
      commit: {
        message: {
          format: '{type}({scope}): {message}',
          types: ['feat', 'fix'],
          scopes: ['core', 'cli'],
        },
      },
    } as never);
    promptMessageConfigMock.mockResolvedValue({
      format: '{type}({scope}): {message}',
      types: ['feat'],
      scopes: ['core'],
    });
    mergeConfigFileMock.mockResolvedValue({} as never);
  });

  it('fails when an existing hook cannot be overwritten', async () => {
    canOverwriteHookMock.mockReturnValue(false);

    await runInstall({ force: false });

    expect(process.exitCode).toBe(1);
    expect(promptMessageConfigMock).not.toHaveBeenCalled();
    expect(mergeConfigFileMock).not.toHaveBeenCalled();
    expect(writeHookFileMock).not.toHaveBeenCalled();
    expect(loggerMock.error).toHaveBeenCalledWith(
      'commit-msg already exists at /repo/.git/hooks/commit-msg. Use --force to replace it.',
    );
  });

  it('prompts, persists config, writes hook, and logs success', async () => {
    const chosen = {
      format: '{type}({scope}): {message}',
      types: ['feat', 'fix'],
      scopes: ['core'],
    };
    promptMessageConfigMock.mockResolvedValueOnce(chosen);

    await runInstall({ force: true });

    expect(canOverwriteHookMock).toHaveBeenCalledWith('/repo/.git/hooks/commit-msg', true);
    expect(promptMessageConfigMock).toHaveBeenCalledWith({
      format: '{type}({scope}): {message}',
      types: ['feat', 'fix'],
      scopes: ['core', 'cli'],
    });
    expect(mergeConfigFileMock).toHaveBeenCalledWith({
      commit: {
        message: chosen,
      },
    });
    expect(writeHookFileMock).toHaveBeenCalledWith('/repo/.git/hooks/commit-msg');
    expect(loggerMock.info).toHaveBeenCalledWith('Installed /repo/.git/hooks/commit-msg');
    expect(process.exitCode).toBeUndefined();
  });
});
