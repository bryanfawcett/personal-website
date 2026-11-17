/** One problem found in a piece of content, written for the person editing it. */
export interface Finding {
  /** Stable machine id, `area.problem`. Never reworded: tests, dashboards and other ports key on it. */
  readonly rule: string;
  readonly severity: 'error' | 'warning';
  /** Where in the entry: `body[3]`, `cover`, `slug`. Machine readable. */
  readonly path: string;
  /** Plain English, specific, and says how to fix it. */
  readonly message: string;
}

/** The slice of Portable Text the rules read. Unknown blocks and fields are ignored, never thrown on. */
export interface PtSpan {
  readonly _type?: string;
  readonly text?: string;
  readonly marks?: readonly string[];
}
export interface PtMarkDef {
  readonly _key?: string;
  readonly _type?: string;
  readonly href?: unknown;
}
export interface PtBlock {
  readonly _type?: string;
  readonly style?: string;
  readonly children?: readonly PtSpan[];
  readonly markDefs?: readonly PtMarkDef[];
  readonly alt?: unknown;
  readonly asset?: unknown;
}

/** An entry as the translation rules see it. */
export interface EntryRef {
  readonly id: string;
  readonly locale: string | null;
  readonly slug: string | null;
  readonly status: string;
}
