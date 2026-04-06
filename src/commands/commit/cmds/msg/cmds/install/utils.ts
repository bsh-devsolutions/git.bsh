import { execSync } from 'child_process';
import { chmodSync, existsSync, readFileSync, writeFileSync } from 'fs';
import prompts from 'prompts';

import { BshError } from '@lib/errors';
import { logger } from '@src/lib/logger';
import type { Config } from '@src/config/type';

export function gitHooksDir(): string {
    try {
        return execSync('git rev-parse --git-path hooks', {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'pipe'],
        }).trim();
    } catch (error) {
        console.error(error);
        throw new BshError(404, 'Not a Git repository (or hooks path unavailable).');
    }
}

export const messageFormatScript = `#!/bin/sh
# BSH Git — commit message format validator
npx @bshsolutions/git commit msg validate "$1"
`;

export function canOverwriteHook(
    path: string,
    force: boolean,
): boolean {
    if (!existsSync(path)) return true;
    if (force) return true;
    try {
        const content = readFileSync(path, 'utf8');
        if (!content.includes(messageFormatScript)) return true;
    } catch (e) {
        const code =
            e &&
                typeof e === 'object' &&
                'code' in e &&
                typeof (e as { code: unknown }).code === 'string'
                ? (e as { code: string }).code
                : '';
        logger.error(`Could not read ${path}${code ? ` (${code})` : ''}.`);
        process.exitCode = 1;
        return false;
    }
    process.exitCode = 1;
    return false;
}

export const writeHookFile = (path: string) => {
    writeFileSync(path, messageFormatScript, { encoding: 'utf8' });
    chmodSync(path, 0o755);
};

export type MessageConfig = Config['commit']['message'];

function toCsv(values: string[]): string {
    return values.join(', ');
}

function fromCsv(value: string): string[] {
    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

const cancelPrompts = {
    onCancel: (): never => {
        process.exit(130);
    },
};

export async function promptMessageConfig(defaults: MessageConfig): Promise<MessageConfig> {
    if (!process.stdin.isTTY || !process.stdout.isTTY) return defaults;

    logger.info('Configure commit message defaults. Press Enter to keep current values.');

    const formatResponse = await prompts(
        {
            type: 'text',
            name: 'format',
            message: 'Commit format',
            initial: defaults.format,
        },
        cancelPrompts,
    );

    const typesResponse = await prompts(
        {
            type: 'text',
            name: 'types',
            message: 'Commit types (comma-separated)',
            initial: toCsv(defaults.types),
        },
        cancelPrompts,
    );

    const scopesResponse = await prompts(
        {
            type: 'text',
            name: 'scopes',
            message: 'Commit scopes (comma-separated)',
            initial: toCsv(defaults.scopes),
        },
        cancelPrompts,
    );

    const format =
        String(formatResponse.format ?? '').trim() || defaults.format;
    const typesStr = String(typesResponse.types ?? '').trim();
    const scopesStr = String(scopesResponse.scopes ?? '').trim();

    return {
        format,
        types: typesStr === '' ? defaults.types : fromCsv(typesStr),
        scopes: scopesStr === '' ? defaults.scopes : fromCsv(scopesStr),
    };
}