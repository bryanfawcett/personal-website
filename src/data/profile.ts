/**
 * Everything about Bryan that more than one page needs.
 * Content lives in TypeScript so the pages stay markup.
 */

export interface SocialLink {
  readonly name: string;
  readonly handle: string;
  readonly href: string;
}

export const PROFILE = {
  name: 'Bryan Fawcett',
  title: 'Digital Craftsman',
  role: 'Technology & Innovation Coordinator',
  employer: 'Singapore American School',
  location: 'Singapore',
  email: 'bryan@nyuchi.com',
  tagline: 'I craft dynamic ecosystems that unite and empower communities.',
  summary:
    'Technology & Innovation Coordinator building digital ecosystems that unite and empower communities. Founder of Nyuchi Africa.',
  knowsAbout: [
    'Education Technology',
    'Systems Architecture',
    'Cybersecurity',
    'Digital Innovation',
    'IT Governance',
    'Process Optimization',
  ],
  socials: [
    { name: 'LinkedIn', handle: 'bryandavidfawcett', href: 'https://www.linkedin.com/in/bryandavidfawcett/' },
    { name: 'GitHub', handle: 'bryanfawcett', href: 'https://github.com/bryanfawcett/' },
    { name: 'Twitter', handle: '@bryanfawcett', href: 'https://x.com/bryanfawcett' },
    { name: 'Email', handle: 'bryan@nyuchi.com', href: 'mailto:bryan@nyuchi.com' },
  ],
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
  socials: readonly SocialLink[];
};

export interface NavItem {
  readonly label: string;
  readonly href: string;
}

export const NAV: readonly NavItem[] = [
  { label: 'Profile', href: '/' },
  { label: 'Experience', href: '/experience' },
  { label: 'Origins', href: '/origins-with-perspective' },
  { label: 'Book a Call', href: '/book' },
];
