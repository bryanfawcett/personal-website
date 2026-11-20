/**
 * The contact card, as vCard 3.0.
 *
 * Produced at build time and served at /bryan-fawcett.vcf. The QR on the card
 * used to carry this whole record; it now carries the booking link instead
 * (see qr.ts), and this file is what "Download .vcf" saves.
 *
 * 3.0 rather than 4.0: iOS and Android both read 3.0 without complaint, and
 * several older Android scanners still choke on 4.0's `KIND` and typed URLs.
 */
import { PROFILE } from '../data/profile.js';
import { SITE_URL } from '../data/site.js';

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
    `URL:${SITE_URL}`,
    ...PROFILE.socials
      .filter((s) => s.href.startsWith('http'))
      .map((s) => `URL;TYPE=${s.name.toUpperCase()}:${s.href}`),
    `ADR;TYPE=WORK:;;;${escape(PROFILE.location)};;;`,
    `NOTE:${escape(PROFILE.tagline)}`,
    'END:VCARD',
  ];

  return `${lines.map(fold).join('\r\n')}\r\n`;
}
