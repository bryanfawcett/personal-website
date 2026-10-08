/**
 * The contact card's QR: a link straight to the booking page.
 *
 * The card's one job on this site is the same as the page's — get a call
 * booked — so the code opens the 30-minute Cal.com event rather than saving a
 * contact. The vCard is still one tap away under it, as "Download .vcf".
 *
 * Drawn in the site's own ink on the sheet blue, both from the tokens, and
 * both written into the SVG itself rather than left to CSS: a code that is
 * screenshotted, saved or printed off the page keeps its ground. Light modules
 * on a dark ground is an inverted code. The iOS Camera and Google Lens read it;
 * re-verify by decoding a real screen capture whenever this changes.
 */
import QRCode from 'qrcode';

import { BOOKING_URL } from '../data/booking.js';
import { INK, SHEET } from './tokens.js';

/**
 * `errorCorrectionLevel: 'M'`: a URL this short makes a small symbol at any
 * level, and M survives a scuffed print without making it denser than a phone
 * across a table wants. `margin: 2` is a wider quiet zone than the vCard
 * needed, because an inverted code leans on it harder to be found.
 */
export async function bookingQr(): Promise<string> {
  return QRCode.toString(BOOKING_URL, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 2,
    color: { dark: INK.base, light: SHEET.base },
  });
}
