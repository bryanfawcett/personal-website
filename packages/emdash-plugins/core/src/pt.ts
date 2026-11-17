import type { PtBlock } from './types.ts';

/** The blocks of a Portable Text value; anything that is not an array of objects is an empty body. */
export function blocks(body: unknown): PtBlock[] {
  return Array.isArray(body) ? (body.filter((b) => b && typeof b === 'object') as PtBlock[]) : [];
}
