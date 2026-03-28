import type { HelloOptions } from './types.js';

export function runHello(options: HelloOptions): void {
  console.log(`Hello, ${options.name}!`);
}
