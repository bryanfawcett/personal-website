/**
 * The contact card, as vCard 3.0 and as a QR code.
 *
 * Both are produced at build time. The vCard is written straight into the QR
 * rather than a URL pointing at a .vcf, so scanning it saves the contact with
 * no network round-trip — which is the whole point at a conference where the
 * wifi is a queue.
 *
 * 3.0 rather than 4.0: iOS and Android both read 3.0 without complaint, and
 * several older Android scanners still choke on 4.0's `KIND` and typed URLs.
 */
import QRCode from 'qrcode';

import { PROFILE } from '../data/profile.js';

/**
 * RFC 6350 §3.4 — escape the delimiters, then fold to 75 octets.
 *
 * Unfolded long lines are the usual reason a card imports with a truncated
 * title on one platform and not another.
 */
function escape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function fold(line: string): string {
  if (line.length <= 75) return line;
  const parts = [line.slice(0, 75)];
  for (let i = 75; i < line.length; i += 74) parts.push(` ${line.slice(i, i + 74)}`);
  return parts.join('\r\n');
}

/** The vCard, CRLF-delimited as the spec requires. */
export function vcard(): string {
  const [surname, ...rest] = PROFILE.name.split(' ').reverse();
  const given = rest.reverse().join(' ');
  const primary = PROFILE.roles[0];

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escape(surname ?? '')};${escape(given)};;;`,
    `FN:${escape(PROFILE.name)}`,
    `ORG:${escape(primary?.org ?? '')}`,
    `TITLE:${escape(primary?.title ?? PROFILE.title)}`,
    `ROLE:${escape(PROFILE.title)}`,
    `EMAIL;TYPE=INTERNET,PREF:${PROFILE.email}`,
    'URL:https://bryanfawcett.com',
    ...PROFILE.socials
      .filter((s) => s.href.startsWith('http'))
      .map((s) => `URL;TYPE=${s.name.toUpperCase()}:${s.href}`),
    `ADR;TYPE=WORK:;;;${escape(PROFILE.location)};;;`,
    `NOTE:${escape(PROFILE.tagline)}`,
    'END:VCARD',
  ];

  return `${lines.map(fold).join('\r\n')}\r\n`;
}

/**
 * The same card as an inline SVG QR.
 *
 * `errorCorrectionLevel: 'M'` is the trade: 'H' would survive a worse camera
 * but pushes this payload to a denser symbol that phones find harder to lock
 * onto on a screen. `margin: 1` keeps the quiet zone the spec wants without
 * wasting a ring of pixels.
 */
export async function vcardQr(): Promise<string> {
  return QRCode.toString(vcard(), {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 1,
    color: { dark: '#F2F6FB', light: '#00000000' },
  });
}
