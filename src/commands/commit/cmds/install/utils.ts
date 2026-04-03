import { execSync } from 'child_process';
import { chmodSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { createInterface } from 'node:readline';

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
npx @bshsolutions/git commit validate "$1"
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

export async function promptMessageConfig(defaults: MessageConfig): Promise<MessageConfig> {
    if (!process.stdin.isTTY || !process.stdout.isTTY) return defaults;

    logger.info('Configure commit message defaults. Press Enter to keep current values.');

    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const askWithDefault = async (question: string, defaultValue: string): Promise<string> => {
        const answer = await new Promise<string>((resolve) => {
            rl.question(question, resolve);
        });
        const trimmed = answer.trim();
        return trimmed === '' ? defaultValue : trimmed;
    };

    let format = defaults.format;
    let typesInput = toCsv(defaults.types);
    let scopesInput = toCsv(defaults.scopes);

    try {
        format = await askWithDefault(
            `Commit format "${defaults.format}": `,
            defaults.format,
        );
        typesInput = await askWithDefault(
            `Commit types (comma-separated) [${toCsv(defaults.types)}]: `,
            toCsv(defaults.types),
        );
        scopesInput = await askWithDefault(
            `Commit scopes (comma-separated) [${toCsv(defaults.scopes)}]: `,
            toCsv(defaults.scopes),
        );
    } finally {
        rl.close();
    }

    return {
        format,
        types: fromCsv(typesInput),
        scopes: fromCsv(scopesInput),
    };
}