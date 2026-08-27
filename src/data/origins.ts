import type { MineralName } from '../brand/minerals.js';
import type { Bilingual } from '../i18n/localize.js';
import { listInLang } from '../i18n/localize.js';
import type { Lang } from '../i18n/ui.js';

export interface JourneyStop {
  readonly period: string;
  readonly place: string;
  readonly title: string;
  readonly detail: string;
  readonly mineral: MineralName;
}

const JOURNEY_SOURCE: readonly Bilingual<
  JourneyStop,
  'period' | 'place' | 'title' | 'detail'
>[] = [
  {
    period: '2012',
    place: 'Zimbabwe',
    title: 'Head of Products, eLearning Solutions',
    detail:
      'Took digital content and Intel Teach training into Zimbabwean schools — running 21st-century learning workshops in computer labs that often had no reliable power.',
    mineral: 'copper',
    zh: {
      period: '2012 年',
      place: '津巴布韦',
      title: 'eLearning Solutions 产品负责人',
      detail:
        '把数字内容与 Intel Teach 培训带进津巴布韦的学校——在常常连电都不稳的计算机教室里，开办「21 世纪学习」工作坊。',
    },
  },
  {
    period: '2012 – 2013',
    place: 'Harare, Zimbabwe',
    title: "Teacher, St John's College",
    detail:
      'Geography, IT and History for Forms 1–3, plus cricket, field hockey and the Grade 8 outdoor education camp. My first view of assessment from the other side of the desk.',
    mineral: 'terracotta',
    zh: {
      period: '2012 – 2013 年',
      place: '津巴布韦 哈拉雷',
      title: "St John's College 教师",
      detail:
        '任教中学一至三年级的地理、信息技术与历史，还带板球、曲棍球和 8 年级的户外教育营。那是我第一次从讲台这一侧看「评估」这件事。',
    },
  },
  {
    period: '2014 – 2016',
    place: 'Johannesburg, South Africa',
    title: 'Teacher, then Assistant Principal, St John the Baptist',
    detail:
      'Built hands-on Cambridge Checkpoint and IGCSE curriculum for students from underserved communities in Roodepoort, then moved into administration, instructional technology and campus infrastructure.',
    mineral: 'gold',
    zh: {
      period: '2014 – 2016 年',
      place: '南非 约翰内斯堡',
      title: 'St John the Baptist 教师，后任副校长',
      detail:
        '为 Roodepoort 弱势社区的学生打造以动手实践为主的剑桥 Checkpoint 与 IGCSE 课程，随后转向行政、教学技术与校园基础设施。',
    },
  },
  {
    period: '2016 – present',
    place: 'Africa, remote',
    title: 'Founder, Nyuchi Africa',
    detail:
      'A decade of building digital infrastructure for African communities under the Ubuntu philosophy — "I am because we are." Learning, language, news, events, travel.',
    mineral: 'malachite',
    zh: {
      period: '2016 年至今',
      place: '非洲，远程',
      title: 'Nyuchi Africa 创始人',
      detail:
        '十年间以乌班图（Ubuntu）哲学为本，为非洲社区搭建数字基础设施——「我在，因为我们在」。学习、语言、新闻、活动、旅行。',
    },
  },
  {
    period: '2019 – 2023',
    place: 'Osaka, Japan',
    title: 'ICT Coordinator & Network Manager, Osaka YMCA International School',
    detail:
      'Stood up the technology for an entire new high school campus — network, CCTV, classroom tech, device management across five operating systems — and built the behaviour and medical data reporting the school ran on.',
    mineral: 'sodalite',
    zh: {
      period: '2019 – 2023 年',
      place: '日本 大阪',
      title: 'Osaka YMCA International School ICT 协调员兼网络管理员',
      detail:
        '为一所全新的高中校区从零搭起技术底座——网络、监控、教室设备，以及横跨五种操作系统的设备管理——并做出了学校日常依赖的行为与医务数据报表。',
    },
  },
  {
    period: '2023 – present',
    place: 'Singapore',
    title: 'Technology & Innovation Coordinator, Singapore American School',
    detail:
      'Arrived here through IT infrastructure and privacy & governance. Now working on how technology changes what teaching and learning can actually look like.',
    mineral: 'cobalt',
    zh: {
      period: '2023 年至今',
      place: '新加坡',
      title: 'Singapore American School 技术与创新协调员',
      detail:
        '从 IT 基础设施、隐私与治理一路走到这里。如今在做的，是技术如何真正改变教与学可能的样子。',
    },
  },
];

export function journey(lang: Lang): JourneyStop[] {
  return listInLang(JOURNEY_SOURCE, lang);
}

export interface WorkItem {
  readonly title: string;
  readonly detail: string;
  readonly mineral: MineralName;
  readonly href?: string;
}

const SCHOOL_WORK_SOURCE: readonly Bilingual<WorkItem, 'title' | 'detail'>[] = [
  {
    title: 'AI tooling for educators',
    detail:
      'Introducing tools that can recall and synthesise information instantly — which is exactly what makes the assessment question urgent.',
    mineral: 'sodalite',
    zh: {
      title: '给教育者的 AI 工具',
      detail:
        '引入能瞬间检索并整合信息的工具——而这恰恰让「评估」这个问题变得迫在眉睫。',
    },
  },
  {
    title: 'The Toddle transition',
    detail:
      'Moving how we plan, document and report on learning, which means deciding what is worth capturing in the first place.',
    mineral: 'cobalt',
    zh: {
      title: '迁移到 Toddle',
      detail:
        '改变我们规划、记录与汇报学习的方式，这意味着首先要决定：什么才值得被记录下来。',
    },
  },
  {
    title: 'Educator Eval & the Digital Toolkit',
    detail:
      'Platforms for evaluation, growth conversations, shared tools, and a single place for institutional knowledge to live.',
    mineral: 'malachite',
    zh: {
      title: 'Educator Eval 与数字工具箱',
      detail: '用于评估、成长对话与共享工具的平台，也让机构知识终于有一个统一的落脚处。',
    },
  },
  {
    title: 'Privacy & governance',
    detail:
      'The groundwork before any of this: student data handled properly, systems that hold up to scrutiny.',
    mineral: 'tanzanite',
    zh: {
      title: '隐私与治理',
      detail: '这一切之前的地基：学生数据被妥善处置，系统经得起审视。',
    },
  },
];

const NYUCHI_WORK_SOURCE: readonly Bilingual<WorkItem, 'title' | 'detail'>[] = [
  {
    title: 'Nyuchi Learning',
    detail: 'Open-source K–12 digital transformation frameworks, built for African schools.',
    mineral: 'malachite',
    href: 'https://learning.nyuchi.com',
    zh: {
      title: 'Nyuchi Learning',
      detail: '为非洲学校打造的开源 K–12 数字化转型框架。',
    },
  },
  {
    title: 'Nyuchi Lingo',
    detail: 'A language learning platform for African languages.',
    mineral: 'terracotta',
    href: 'https://lingo.nyuchi.com',
    zh: { title: 'Nyuchi Lingo', detail: '一个面向非洲语言的学习平台。' },
  },
  {
    title: 'Mukoko & Mukoko News',
    detail:
      'A privacy-focused social platform, and pan-African news aggregated from trusted regional sources.',
    mineral: 'tanzanite',
    href: 'https://mukoko.com',
    zh: {
      title: 'Mukoko 与 Mukoko News',
      detail: '一个注重隐私的社交平台，以及汇聚可信区域来源的泛非新闻。',
    },
  },
  {
    title: 'Nhimbe',
    detail:
      'Community events and gatherings — named for the Shona tradition of working a field together.',
    mineral: 'copper',
    href: 'https://nhimbe.com',
    zh: {
      title: 'Nhimbe',
      detail: '社区活动与聚会——名字取自绍纳人合力耕作同一片田地的传统。',
    },
  },
];

export function schoolWork(lang: Lang): WorkItem[] {
  return listInLang(SCHOOL_WORK_SOURCE, lang);
}

export function nyuchiWork(lang: Lang): WorkItem[] {
  return listInLang(NYUCHI_WORK_SOURCE, lang);
}

export interface Aptitude {
  readonly name: string;
  readonly detail: string;
  readonly mineral: MineralName;
}

const PINK_APTITUDES_SOURCE: readonly Bilingual<Aptitude, 'name' | 'detail'>[] = [
  {
    name: 'Design',
    detail: 'Combining utility and significance — thinking like a designer.',
    mineral: 'tanzanite',
    zh: { name: '设计感', detail: '把实用与意义合而为一——像设计师那样思考。' },
  },
  {
    name: 'Story',
    detail: 'Putting facts in context and delivering them with emotional impact.',
    mineral: 'gold',
    zh: { name: '故事力', detail: '把事实放回脉络之中，并让它打动人心。' },
  },
  {
    name: 'Symphony',
    detail: 'Combining disparate pieces into a whole greater than the sum of its parts.',
    mineral: 'cobalt',
    zh: { name: '交响力', detail: '把彼此不相干的碎片，合成一个大于各部分之和的整体。' },
  },
  {
    name: 'Empathy',
    detail: "Seeing with others' eyes, hearing with others' ears, feeling with others' hearts.",
    mineral: 'terracotta',
    zh: { name: '共情力', detail: '以他人的眼睛去看，以他人的耳朵去听，以他人的心去感受。' },
  },
  {
    name: 'Play',
    detail: 'Not only a source of joy, but a pathway to creativity and inspiration.',
    mineral: 'malachite',
    zh: { name: '玩乐力', detail: '它不只是快乐的来源，更是通往创造与灵感的路径。' },
  },
  {
    name: 'Meaning',
    detail: 'The pursuit of significance in a world of increasing material well-being.',
    mineral: 'copper',
    zh: { name: '意义感', detail: '在物质日渐丰裕的世界里，对意义本身的追寻。' },
  },
];

export function pinkAptitudes(lang: Lang): Aptitude[] {
  return listInLang(PINK_APTITUDES_SOURCE, lang);
}

export interface OpenQuestion {
  readonly title: string;
  readonly body: string;
  readonly mineral: MineralName;
}

const OPEN_QUESTIONS_SOURCE: readonly Bilingual<OpenQuestion, 'title' | 'body'>[] = [
  {
    title: 'Different perspectives',
    body: 'What might we discover about how different minds demonstrate understanding? How do cultural backgrounds shape what we recognise as intelligence?',
    mineral: 'cobalt',
    zh: {
      title: '不同的视角',
      body: '关于不同的心智如何展现理解，我们还可能发现些什么？文化背景又如何塑造了我们所认可的「智力」？',
    },
  },
  {
    title: 'Cultural lens',
    body: 'How do different backgrounds shape what we see as "intelligence"? What valuable ways of knowing might we be overlooking entirely?',
    mineral: 'terracotta',
    zh: {
      title: '文化的透镜',
      body: '不同的成长背景，如何塑造我们眼中的「智力」？又有哪些珍贵的认知方式，被我们完全忽略了？',
    },
  },
  {
    title: 'Hidden barriers',
    body: 'Could our assessment methods create unintended barriers? Are there brilliant minds we filter out before we ever recognise their potential?',
    mineral: 'gold',
    zh: {
      title: '看不见的门槛',
      body: '我们的评估方式，会不会无意中筑起了门槛？会不会有些出色的心智，还没被看见潜力就已被筛掉？',
    },
  },
  {
    title: 'Strategic alignment',
    body: "How might we capture our seven capabilities more fully through the tools we already have? What can we measure that we currently don't?",
    mineral: 'malachite',
    zh: {
      title: '与目标对齐',
      body: '用我们手上已有的工具，怎样才能更完整地呈现那七项能力？又有哪些东西是可以衡量、而我们目前没有衡量的？',
    },
  },
];

export function openQuestions(lang: Lang): OpenQuestion[] {
  return listInLang(OPEN_QUESTIONS_SOURCE, lang);
}
