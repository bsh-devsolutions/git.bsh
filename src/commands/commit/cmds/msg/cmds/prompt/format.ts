export type FormatToken = 'type' | 'scope' | 'message';

export function formatTokenOrder(format: string): FormatToken[] {
  const re = /\{(type|scope|message)\}/g;
  const order: FormatToken[] = [];
  const seen = new Set<FormatToken>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(format)) !== null) {
    const t = m[1] as FormatToken;
    if (!seen.has(t)) {
      seen.add(t);
      order.push(t);
    }
  }
  return order;
}

export function formatTokenUsage(format: string): {
  type: boolean;
  scope: boolean;
  message: boolean;
} {
  const tokens = formatTokenOrder(format);
  return {
    type: tokens.includes('type'),
    scope: tokens.includes('scope'),
    message: tokens.includes('message'),
  };
}

export function buildMessageFromParts(
  format: string,
  parts: Partial<Record<FormatToken, string>>,
): string {
  return format
    .replace(/\{type\}/g, parts.type ?? '')
    .replace(/\{scope\}/g, parts.scope ?? '')
    .replace(/\{message\}/g, parts.message ?? '');
}
