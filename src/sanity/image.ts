/**
 * Sanity image URLs, built by hand.
 *
 * `@sanity/image-url` does this too, but the whole job is parsing one
 * well-specified reference string and appending query parameters — a
 * dependency in the Worker bundle for about twenty lines. The reference format
 * is fixed and documented:
 *
 *     image-<assetId>-<width>x<height>-<extension>
 *
 * and the file it names is served from
 *
 *     https://cdn.sanity.io/images/<projectId>/<dataset>/<assetId>-<w>x<h>.<ext>
 *
 * `parseImageRef` is exported so the shape is testable without a network call
 * or an uploaded asset.
 */
import { SANITY_DATASET, SANITY_PROJECT_ID } from './client.js';
import type { SanityImage } from './types.js';

export interface ParsedImageRef {
  readonly assetId: string;
  readonly width: number;
  readonly height: number;
  readonly extension: string;
}

const REF_PATTERN = /^image-([a-zA-Z0-9]+)-(\d+)x(\d+)-(\w+)$/;

/** Pull the parts out of an asset reference. `null` if it is not one. */
export function parseImageRef(ref: string | undefined): ParsedImageRef | null {
  if (!ref) return null;

  const match = REF_PATTERN.exec(ref);
  if (!match) return null;

  const [, assetId, width, height, extension] = match;
  if (!assetId || !width || !height || !extension) return null;

  return {
    assetId,
    width: Number.parseInt(width, 10),
    height: Number.parseInt(height, 10),
    extension,
  };
}

export interface ImageOptions {
  /** Rendered width in CSS pixels. The URL asks for twice this. */
  readonly width: number;
  /** Crop to this aspect ratio instead of keeping the source's. */
  readonly aspect?: number | undefined;
}

export interface ResolvedImage {
  readonly src: string;
  readonly srcset: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
}

/**
 * Turn an image field into everything an `<img>` needs.
 *
 * Returns `null` rather than a broken URL when the field is missing or its
 * reference is malformed — every caller has to handle "no cover" anyway, since
 * the field is optional in the Studio, so there is no second path to write.
 */
export function resolveImage(image: SanityImage | undefined, options: ImageOptions): ResolvedImage | null {
  const parsed = parseImageRef(image?.asset?._ref);
  if (!parsed) return null;

  const base = `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${parsed.assetId}-${parsed.width}x${parsed.height}.${parsed.extension}`;

  const height = options.aspect
    ? Math.round(options.width / options.aspect)
    : Math.round((options.width * parsed.height) / parsed.width);

  const params = (w: number): string => {
    const search = new URLSearchParams({
      w: String(w),
      // `fm=webp` rather than `auto=format`: the Worker sets no Accept-based
      // Vary, and every browser that reaches this site takes webp.
      fm: 'webp',
      q: '72',
      fit: options.aspect ? 'crop' : 'max',
    });
    if (options.aspect) {
      search.set('h', String(Math.round(w / options.aspect)));
      // Respect the hotspot the editor set in the Studio rather than
      // centre-cropping a face out of frame.
      search.set('crop', 'focalpoint');
    }
    return `${base}?${search.toString()}`;
  };

  return {
    src: params(options.width * 2),
    srcset: `${params(options.width)} 1x, ${params(options.width * 2)} 2x`,
    width: options.width,
    height,
    alt: image?.alt ?? '',
  };
}
