import { describe, expect, it } from 'vitest';

import {
  buildMessageFromParts,
  formatTokenOrder,
  formatTokenUsage,
} from '@src/commands/commit/cmds/msg/cmds/prompt/format';

describe('commit msg prompt format helpers', () => {
  it('formatTokenOrder returns unique tokens in first-appearance order', () => {
    expect(formatTokenOrder('{type} ({scope}): {message}')).toEqual(['type', 'scope', 'message']);
    expect(formatTokenOrder('{message} — {type}')).toEqual(['message', 'type']);
  });

  it('formatTokenUsage reflects which placeholders exist', () => {
    expect(formatTokenUsage('{type}: {message}')).toEqual({
      type: true,
      scope: false,
      message: true,
    });
  });

  it('buildMessageFromParts substitutes placeholders', () => {
    expect(
      buildMessageFromParts('{type} ({scope}): {message}', {
        type: 'feat',
        scope: 'cli',
        message: 'add prompt',
      }),
    ).toBe('feat (cli): add prompt');
  });
});
