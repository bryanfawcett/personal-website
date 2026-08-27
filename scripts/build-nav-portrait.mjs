/**
 * Render the masthead portrait once, into public/nav-portrait.webp.
 *
 * The nav used `<Image>` from astro:assets, which works on a prerendered page
 * and breaks on an on-demand one: under `imageService: 'compile'` the adapter
 * emits a `/_image?…` URL for on-demand routes, and there is no runtime image
 * service behind it — so the masthead portrait 404s on every /adventures page
 * while looking perfect everywhere else.
 *
 * The alternatives were worse. `imageService: 'cloudflare-binding'` would
 * provision Cloudflare Images to resize one 46px avatar; `passthrough` would
 * ship the 1.5 MB source. So the nav gets a plain <img> pointing at a fixed,
 * unhashed path, and this renders the file.
 *
 * Not a build step, for the same reason the social card is not one: it only
 * changes when the portrait does. Run by hand after that:
 *
 *   pnpm nav-portrait
 *
 * The larger portrait on the home page and the contact card still goes through
 * astro:assets — those pages are prerendered, where it works.
 */
import sharp from 'sharp';

// 46px in the layout, rendered at 2x so it stays crisp on a retina screen.
const SIZE = 92;

const source = sharp('src/assets/bryan-fawcett.png');
const { width = 0, height = 0 } = await source.metadata();

/*
 * Square crop pulled up onto the face.
 *
 * `object-position: 50% 22%` in SiteNav.astro did this in CSS when the element
 * was a full portrait. Cropping here instead keeps the same framing while
 * letting the file itself be square and small.
 */
const side = Math.min(width, height);
const top = Math.round((height - side) * 0.22);
const left = Math.round((width - side) / 2);

await source
  .extract({ left, top, width: side, height: side })
  .resize(SIZE, SIZE)
  .webp({ quality: 82 })
  .toFile('public/nav-portrait.webp');

console.log(`nav portrait ${SIZE}x${SIZE} → public/nav-portrait.webp`);
