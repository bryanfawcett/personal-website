import type { MineralName } from '../brand/minerals.js';

export interface JourneyStop {
  readonly period: string;
  readonly place: string;
  readonly title: string;
  readonly detail: string;
  readonly mineral: MineralName;
}

export const JOURNEY: readonly JourneyStop[] = [
  {
    period: '2012',
    place: 'Zimbabwe',
    title: 'Head of Products, eLearning Solutions',
    detail:
      'Took digital content and Intel Teach training into Zimbabwean schools — running 21st-century learning workshops in computer labs that often had no reliable power.',
    mineral: 'copper',
  },
  {
    period: '2012 – 2013',
    place: 'Harare, Zimbabwe',
    title: "Teacher, St John's College",
    detail:
      'Geography, IT and History for Forms 1–3, plus cricket, field hockey and the Grade 8 outdoor education camp. My first view of assessment from the other side of the desk.',
    mineral: 'terracotta',
  },
  {
    period: '2014 – 2016',
    place: 'Johannesburg, South Africa',
    title: 'Teacher, then Assistant Principal, St John the Baptist',
    detail:
      'Built hands-on Cambridge Checkpoint and IGCSE curriculum for students from underserved communities in Roodepoort, then moved into administration, instructional technology and campus infrastructure.',
    mineral: 'gold',
  },
  {
    period: '2016 – present',
    place: 'Africa, remote',
    title: 'Founder, Nyuchi Africa',
    detail:
      'A decade of building digital infrastructure for African communities under the Ubuntu philosophy — "I am because we are." Learning, language, news, events, travel.',
    mineral: 'malachite',
  },
  {
    period: '2019 – 2023',
    place: 'Osaka, Japan',
    title: 'ICT Coordinator & Network Manager, Osaka YMCA International School',
    detail:
      'Stood up the technology for an entire new high school campus — network, CCTV, classroom tech, device management across five operating systems — and built the behaviour and medical data reporting the school ran on.',
    mineral: 'sodalite',
  },
  {
    period: '2023 – present',
    place: 'Singapore',
    title: 'Technology & Innovation Coordinator, Singapore American School',
    detail:
      'Arrived here through IT infrastructure and privacy & governance. Now working on how technology changes what teaching and learning can actually look like.',
    mineral: 'cobalt',
  },
];

export interface WorkItem {
  readonly title: string;
  readonly detail: string;
  readonly mineral: MineralName;
  readonly href?: string;
}

export const SCHOOL_WORK: readonly WorkItem[] = [
  {
    title: 'AI tooling for educators',
    detail:
      'Introducing tools that can recall and synthesise information instantly — which is exactly what makes the assessment question urgent.',
    mineral: 'sodalite',
  },
  {
    title: 'The Toddle transition',
    detail:
      'Moving how we plan, document and report on learning, which means deciding what is worth capturing in the first place.',
    mineral: 'cobalt',
  },
  {
    title: 'Educator Eval & the Digital Toolkit',
    detail:
      'Platforms for evaluation, growth conversations, shared tools, and a single place for institutional knowledge to live.',
    mineral: 'malachite',
  },
  {
    title: 'Privacy & governance',
    detail:
      'The groundwork before any of this: student data handled properly, systems that hold up to scrutiny.',
    mineral: 'tanzanite',
  },
];

export const NYUCHI_WORK: readonly WorkItem[] = [
  {
    title: 'Nyuchi Learning',
    detail: 'Open-source K–12 digital transformation frameworks, built for African schools.',
    mineral: 'malachite',
    href: 'https://learning.nyuchi.com',
  },
  {
    title: 'Nyuchi Lingo',
    detail: 'A language learning platform for African languages.',
    mineral: 'terracotta',
    href: 'https://lingo.nyuchi.com',
  },
  {
    title: 'Mukoko & Mukoko News',
    detail:
      'A privacy-focused social platform, and pan-African news aggregated from trusted regional sources.',
    mineral: 'tanzanite',
    href: 'https://mukoko.com',
  },
  {
    title: 'Nhimbe',
    detail:
      'Community events and gatherings — named for the Shona tradition of working a field together.',
    mineral: 'copper',
    href: 'https://nhimbe.com',
  },
];

export interface Aptitude {
  readonly name: string;
  readonly detail: string;
  readonly mineral: MineralName;
}

export const PINK_APTITUDES: readonly Aptitude[] = [
  {
    name: 'Design',
    detail: 'Combining utility and significance — thinking like a designer.',
    mineral: 'tanzanite',
  },
  {
    name: 'Story',
    detail: 'Putting facts in context and delivering them with emotional impact.',
    mineral: 'gold',
  },
  {
    name: 'Symphony',
    detail: 'Combining disparate pieces into a whole greater than the sum of its parts.',
    mineral: 'cobalt',
  },
  {
    name: 'Empathy',
    detail: "Seeing with others' eyes, hearing with others' ears, feeling with others' hearts.",
    mineral: 'terracotta',
  },
  {
    name: 'Play',
    detail: 'Not only a source of joy, but a pathway to creativity and inspiration.',
    mineral: 'malachite',
  },
  {
    name: 'Meaning',
    detail: 'The pursuit of significance in a world of increasing material well-being.',
    mineral: 'copper',
  },
];

export interface OpenQuestion {
  readonly title: string;
  readonly body: string;
  readonly mineral: MineralName;
}

export const OPEN_QUESTIONS: readonly OpenQuestion[] = [
  {
    title: 'Different perspectives',
    body: 'What might we discover about how different minds demonstrate understanding? How do cultural backgrounds shape what we recognise as intelligence?',
    mineral: 'cobalt',
  },
  {
    title: 'Cultural lens',
    body: 'How do different backgrounds shape what we see as "intelligence"? What valuable ways of knowing might we be overlooking entirely?',
    mineral: 'terracotta',
  },
  {
    title: 'Hidden barriers',
    body: 'Could our assessment methods create unintended barriers? Are there brilliant minds we filter out before we ever recognise their potential?',
    mineral: 'gold',
  },
  {
    title: 'Strategic alignment',
    body: "How might we capture our seven capabilities more fully through the tools we already have? What can we measure that we currently don't?",
    mineral: 'malachite',
  },
];
