/**
 * Everything about Bryan that more than one page needs.
 * Content lives in TypeScript so the pages stay markup.
 */

import type { Bilingual } from '../i18n/localize.js';
import { listInLang } from '../i18n/localize.js';
import type { Lang, UiKey } from '../i18n/ui.js';

export interface SocialLink {
  /**
   * The canonical, English name. `vcard.ts` upper-cases it for the vCard's
   * `URL;TYPE=` parameter, so it stays English in both languages; use
   * `socialsInLang` for the label a reader sees.
   */
  readonly name: string;
  readonly handle: string;
  readonly href: string;
}

export interface Role {
  readonly title: string;
  readonly org: string;
}

/**
 * The organisation names are proper nouns and stay in Latin script; only the
 * job title is translated, with the employer glossed once where a reader
 * needs the handhold.
 */
const ROLES: readonly Bilingual<Role, 'title' | 'org'>[] = [
  {
    title: 'Founder & CEO',
    org: 'Nyuchi Africa',
    zh: { title: '创始人兼首席执行官', org: 'Nyuchi Africa' },
  },
  {
    title: 'Founder',
    org: 'The Bundu Foundation',
    zh: { title: '创始人', org: 'The Bundu Foundation' },
  },
  {
    title: 'Associate Technology & Innovation Coordinator',
    org: 'Singapore American School',
    zh: { title: '技术与创新协调员（副职）', org: 'Singapore American School' },
  },
];

/**
 * Three of the four names are the platform's own and stay as they are in both
 * languages; "Email" is the one generic word among them, so it is the one that
 * gets a Chinese label.
 */
const SOCIALS: readonly Bilingual<SocialLink, 'name'>[] = [
  {
    name: 'LinkedIn',
    handle: 'bryandavidfawcett',
    href: 'https://www.linkedin.com/in/bryandavidfawcett/',
    zh: { name: 'LinkedIn' },
  },
  {
    name: 'GitHub',
    handle: 'bryanfawcett',
    href: 'https://github.com/bryanfawcett/',
    zh: { name: 'GitHub' },
  },
  {
    name: 'Twitter',
    handle: '@bryanfawcett',
    href: 'https://x.com/bryanfawcett',
    zh: { name: 'Twitter' },
  },
  {
    name: 'Email',
    handle: 'bryan@nyuchi.com',
    href: 'mailto:bryan@nyuchi.com',
    zh: { name: '邮箱' },
  },
];

export const PROFILE = {
  name: 'Bryan Fawcett',
  title: 'Digital Craftsman',
  role: 'Associate Technology & Innovation Coordinator',
  employer: 'Singapore American School',
  location: 'Singapore',
  email: 'bryan@nyuchi.com',
  tagline: 'I craft digital ecosystems that unite and empower communities.',
  summary:
    'A systems thinker who designs for the whole: people, data, tools and the constraints they live under. Founder & CEO of Nyuchi Africa and founder of The Bundu Foundation.',
  knowsAbout: [
    'Education Technology',
    'Systems Architecture',
    'Cybersecurity',
    'Digital Innovation',
    'IT Governance',
    'Process Optimization',
    'Offline-first Software',
    'Systems Design',
  ],
  /** Every hat, in the order he'd introduce them. */
  roles: ROLES,
  socials: SOCIALS,
} as const satisfies {
  name: string;
  title: string;
  role: string;
  employer: string;
  location: string;
  email: string;
  tagline: string;
  summary: string;
  knowsAbout: readonly string[];
  roles: readonly Bilingual<Role, 'title' | 'org'>[];
  socials: readonly Bilingual<SocialLink, 'name'>[];
};

/** The social links with the labels a reader of `lang` should see. */
export function socialsInLang(lang: Lang): SocialLink[] {
  return listInLang(PROFILE.socials, lang);
}

/**
 * The parts of the profile that change with the language.
 *
 * The name, the email and the social handles are the same in both — a person's
 * name is not a string to translate — so only the descriptive lines move.
 */
const PROFILE_ZH = {
  title: '数字工匠',
  role: '技术与创新协调员（副职）',
  location: '新加坡',
  tagline: '我打造数字生态系统，让社区彼此联结、各得其力。',
  summary:
    '系统思考者，为整体而设计：人、数据、工具，以及它们所处的约束。Nyuchi Africa 创始人兼首席执行官，The Bundu Foundation 创始人。',
} as const;

export interface LocalizedProfile {
  readonly title: string;
  readonly role: string;
  readonly location: string;
  readonly tagline: string;
  readonly summary: string;
  readonly roles: readonly Role[];
}

export function profileInLang(lang: Lang): LocalizedProfile {
  const base = {
    title: PROFILE.title,
    role: PROFILE.role,
    location: PROFILE.location,
    tagline: PROFILE.tagline,
    summary: PROFILE.summary,
  };

  return {
    ...(lang === 'en' ? base : { ...base, ...PROFILE_ZH }),
    roles: listInLang(PROFILE.roles, lang),
  };
}

export interface NavItem {
  /** Key into the chrome dictionary, so the label is never stored twice. */
  readonly labelKey: UiKey;
  /** Language-neutral path; `localizePath` adds the locale prefix. */
  readonly href: string;
}

export const NAV: readonly NavItem[] = [
  { labelKey: 'nav.profile', href: '/' },
  { labelKey: 'nav.experience', href: '/experience' },
  { labelKey: 'nav.adventures', href: '/adventures' },
  { labelKey: 'nav.origins', href: '/origins-with-perspective' },
  { labelKey: 'nav.minerals', href: '/minerals' },
  { labelKey: 'nav.book', href: '/book' },
];
