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
      'End-to-end web applications from architecture to deployment. Educational platforms, travel systems, and community tools — joinery-tight from database to interface.',
    highlights: ['Node.js', 'React', 'Database Design', 'API Architecture'],
  },
  {
    title: 'Systems Architecture',
    description:
      'Scalable, resilient systems that serve real needs — learning platforms, information systems, and organisational dashboards built for reliability and growth.',
    highlights: ['Infrastructure Design', 'System Scalability', 'Data Architecture'],
  },
  {
    title: 'Education Technology',
    description:
      'Deep EdTech expertise that enhances learning at scale. Platforms that hand educators and students accessible, intuitive tools and resources.',
    highlights: ['Learning Platforms', 'Educational Tools', 'EdTech Strategy'],
  },
  {
    title: 'Digital Product Strategy',
    description:
      'Concept to market, end to end. Digital experiences that serve communities — from travel platforms to learning ecosystems to tech director networks.',
    highlights: ['Product Vision', 'Technical Leadership', 'Community Impact'],
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
    title: 'The Bundu Foundation',
    description:
      "The nonprofit researching the standards and open agricultural data commons that Nyuchi, Mukoko and Shamwari AI are building toward — governance in progress, research first",
    href: 'https://bundu.org',
    mineral: 'copper',
  },
  {
    title: 'Mzizi',
    description:
      'The design system the whole ecosystem is built on — seven minerals, Ubuntu doctrine, and an accessibility toolkit, served over an API and an MCP',
    href: 'https://mzizi.dev',
    mineral: 'sodalite',
  },
  {
    title: 'Nyuchi Africa',
    description:
      'The commercial engine of the ecosystem — web presence, payments and hosting that let African entrepreneurs run a business without a large IT team behind them',
    href: 'https://www.nyuchi.com',
    mineral: 'gold',
  },
  {
    title: 'Nyuchi StationKit',
    description:
      'Open-source solar-powered weather and soil station for smallholder farmers — from $25, feeding readings into the open commons',
    href: 'https://www.nyuchi.com/stationkit',
    mineral: 'terracotta',
  },
  {
    title: 'Nyuchi Learning',
    description:
      'Open-source K-12 digital transformation frameworks, so African schools can modernise without locking into expensive proprietary platforms',
    href: 'https://learning.nyuchi.com',
    mineral: 'malachite',
  },
  {
    title: 'Nyuchi Lingo',
    description:
      'A language-learning platform for African languages mainstream apps mostly ignore — built to help preserve and spread them',
    href: 'https://lingo.nyuchi.com',
    mineral: 'terracotta',
  },
  {
    title: 'Mukoko',
    description:
      'Privacy-focused social platform bundling 6 everyday apps into one account, instead of juggling tools built for other markets',
    href: 'https://mukoko.com',
    mineral: 'tanzanite',
  },
  {
    title: 'Mukoko Weather',
    description:
      'AI-powered hyperlocal forecasts and advisory for farming, mining and travel, grounded by StationKit sensor data',
    href: 'https://weather.mukoko.com',
    mineral: 'cobalt',
  },
  {
    title: 'Mukoko News',
    description:
      "Pan-African news aggregation from trusted regional sources — context instead of international outlets' framing",
    href: 'https://news.mukoko.com',
    mineral: 'cobalt',
  },
  {
    title: 'Nhimbe',
    description:
      'Community events and gatherings, named for the Zimbabwean tradition of neighbours coming together to get work done',
    href: 'https://nhimbe.com',
    mineral: 'copper',
  },
  {
    title: 'Shamwari AI',
    description:
      "Nyuchi Africa's open-source initiative for a small, culturally-grounded AI model built to run on affordable, low-bandwidth hardware",
    href: 'https://shamwari.ai',
    mineral: 'sodalite',
  },
  {
    title: 'Zimbabwe Travel Info',
    description: 'A practical travel guide for visitors planning a trip to Zimbabwe',
    href: 'https://travel-info.co.zw',
    mineral: 'cobalt',
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
    description: 'A consistent, supported set of digital tools for staff, instead of ad-hoc solutions per department',
    href: 'https://github.com/SAS-Technology-Innovation/digital-toolkit',
    mineral: 'cobalt',
  },
  {
    title: 'Knowledge Base',
    description:
      'Centralised institutional knowledge — how-tos, policies, processes — that survives staff turnover instead of living in inboxes',
    href: 'https://github.com/SAS-Technology-Innovation/knowledge',
    mineral: 'sodalite',
  },
  {
    title: 'Educator Eval',
    description: 'Educator evaluation and assessment, replacing manual, paper-based review cycles',
    href: 'https://github.com/SAS-Technology-Innovation/EducatorEval',
    mineral: 'malachite',
  },
  {
    title: 'EOI Dashboard',
    description:
      'A live view of expression-of-interest sign-ups, instead of manually collating forms',
    href: 'https://github.com/SAS-Technology-Innovation/Expression-of-Interest-Dashboard',
    mineral: 'tanzanite',
  },
];
