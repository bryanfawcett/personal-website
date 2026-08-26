import type { MineralName } from '../brand/minerals.js';

export interface Principle {
  readonly title: string;
  readonly body: string;
  readonly mineral: MineralName;
}

export const PRINCIPLES: readonly Principle[] = [
  {
    title: 'Resourceful Innovation',
    body: 'Growing up in Africa taught me to do more with less and find elegant solutions under constraints. This informs every system I build — efficient, resilient, and designed for impact.',
    mineral: 'copper',
  },
  {
    title: 'Community First',
    body: 'Whether at SAS or driving Nyuchi Africa, I believe technology should serve people and empower communities. Solutions must be accessible and meaningful.',
    mineral: 'terracotta',
  },
  {
    title: 'Excellence & Trust',
    body: "Security, governance, and best practices aren't afterthoughts — they're foundational. I build systems that educators, travellers, and communities can rely on.",
    mineral: 'cobalt',
  },
  {
    title: 'Knowledge Transfer',
    body: 'Clear documentation and mentorship multiply impact. I empower teams and individuals through education and shared understanding.',
    mineral: 'malachite',
  },
];

export interface Competency {
  readonly title: string;
  readonly description: string;
  readonly highlights: readonly string[];
}

export const COMPETENCIES: readonly Competency[] = [
  {
    title: 'Full Stack Development',
    description:
      'End-to-end web applications from architecture to deployment. Expertise in React, Node.js, and modern web technologies. Building educational platforms, travel systems, and community tools.',
    highlights: ['Node.js', 'React', 'Database Design', 'API Architecture'],
  },
  {
    title: 'Systems Architecture',
    description:
      'Designing scalable, resilient systems that serve real needs. From learning management platforms to information systems and organisational dashboards — built for reliability and growth.',
    highlights: ['Infrastructure Design', 'System Scalability', 'Data Architecture'],
  },
  {
    title: 'Education Technology',
    description:
      'Deep expertise in EdTech solutions that enhance learning at scale. Building platforms that empower educators and students with accessible, intuitive tools and resources.',
    highlights: ['Learning Platforms', 'Educational Tools', 'EdTech Strategy'],
  },
  {
    title: 'Digital Product Strategy',
    description:
      'Taking products from concept to launch with a clear view of who they serve. Shaping roadmaps, governance and delivery so the thing that ships is the thing that was needed.',
    highlights: ['Product Roadmapping', 'IT Governance', 'Process Optimisation'],
  },
];

export interface Project {
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly mineral: MineralName;
}

export const NYUCHI_PROJECTS: readonly Project[] = [
  {
    title: 'Nyuchi Africa',
    description: 'Community-focused business platform for African entrepreneurship',
    href: 'https://www.nyuchi.com',
    mineral: 'gold',
  },
  {
    title: 'Nyuchi Learning',
    description: 'Open-source K-12 digital transformation frameworks for African schools',
    href: 'https://learning.nyuchi.com',
    mineral: 'malachite',
  },
  {
    title: 'Nyuchi Lingo',
    description: 'Language learning platform for African languages',
    href: 'https://lingo.nyuchi.com',
    mineral: 'terracotta',
  },
  {
    title: 'Mukoko',
    description: 'Privacy-focused social platform with 6 integrated apps',
    href: 'https://mukoko.com',
    mineral: 'tanzanite',
  },
  {
    title: 'Mukoko News',
    description: 'Pan-African news aggregation from trusted regional sources',
    href: 'https://news.mukoko.com',
    mineral: 'cobalt',
  },
  {
    title: 'Nhimbe',
    description: 'Community events and gatherings platform',
    href: 'https://nhimbe.com',
    mineral: 'copper',
  },
  {
    title: 'Zimbabwe Travel Info',
    description: 'Comprehensive travel guide for Zimbabwe',
    href: 'https://travel-info.co.zw',
    mineral: 'sodalite',
  },
  {
    title: 'Iconic Expeditions',
    description: 'Luxury bespoke safaris across Southern and Eastern Africa',
    href: 'https://iconic-expeditions.com',
    mineral: 'gold',
  },
];

export const SAS_PROJECTS: readonly Project[] = [
  {
    title: 'Digital Toolkit',
    description: 'Comprehensive digital tools and resources',
    href: 'https://github.com/SAS-Technology-Innovation/digital-toolkit',
    mineral: 'cobalt',
  },
  {
    title: 'Knowledge Base',
    description: 'Centralised knowledge management system',
    href: 'https://github.com/SAS-Technology-Innovation/knowledge',
    mineral: 'sodalite',
  },
  {
    title: 'Educator Eval',
    description: 'Educator evaluation and assessment platform',
    href: 'https://github.com/SAS-Technology-Innovation/EducatorEval',
    mineral: 'malachite',
  },
  {
    title: 'EOI Dashboard',
    description: 'Expression of interest tracking dashboard',
    href: 'https://github.com/SAS-Technology-Innovation/Expression-of-Interest-Dashboard',
    mineral: 'tanzanite',
  },
];
