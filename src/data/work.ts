import type { MineralName } from '../brand/minerals.js';
import type { Bilingual } from '../i18n/localize.js';
import { inLang, listInLang } from '../i18n/localize.js';
import type { Lang } from '../i18n/ui.js';

export interface Principle {
  readonly title: string;
  readonly body: string;
  readonly mineral: MineralName;
}

const PRINCIPLES_SOURCE: readonly Bilingual<Principle, 'title' | 'body'>[] = [
  {
    title: 'Resourceful Innovation',
    body: 'Growing up in Africa taught me to do more with less and find elegant solutions under constraints. This informs every system I build — efficient, resilient, and designed for impact.',
    mineral: 'copper',
    zh: {
      title: '因陋见巧',
      body: '在非洲长大教会我以少成多，在约束之下找到利落的解法。这影响着我构建的每一个系统——高效、坚韧，并为实效而设计。',
    },
  },
  {
    title: 'Community First',
    body: 'Whether at SAS or driving Nyuchi Africa, I believe technology should serve people and empower communities. Solutions must be accessible and meaningful.',
    mineral: 'terracotta',
    zh: {
      title: '社区优先',
      body: '无论是在 SAS，还是推动 Nyuchi Africa，我都相信技术应当服务于人、赋能社区。方案必须触手可及，也必须真的有意义。',
    },
  },
  {
    title: 'Excellence & Trust',
    body: "Security, governance, and best practices aren't afterthoughts — they're foundational. I build systems that educators, travellers, and communities can rely on.",
    mineral: 'cobalt',
    zh: {
      title: '精工与信任',
      body: '安全、治理与最佳实践不是事后补丁，而是地基。我构建的系统，是教育者、旅行者和社区可以放心依赖的。',
    },
  },
  {
    title: 'Knowledge Transfer',
    body: 'Clear documentation and mentorship multiply impact. I empower teams and individuals through education and shared understanding.',
    mineral: 'malachite',
    zh: {
      title: '知识传承',
      body: '清晰的文档与言传身教会让影响成倍放大。我通过教学与共识来赋能团队和个人。',
    },
  },
];

export function principles(lang: Lang): Principle[] {
  return listInLang(PRINCIPLES_SOURCE, lang);
}

export interface Competency {
  readonly title: string;
  readonly description: string;
  readonly highlights: readonly string[];
}

const COMPETENCIES_SOURCE: readonly Bilingual<
  Competency,
  'title' | 'description' | 'highlights'
>[] = [
  {
    title: 'Full Stack Development',
    description:
      'End-to-end web applications from architecture to deployment. Educational platforms, travel systems, and community tools — joinery-tight from database to interface.',
    highlights: ['Node.js', 'React', 'Database Design', 'API Architecture'],
    zh: {
      title: '全栈开发',
      description:
        '从架构到部署的端到端 Web 应用。教育平台、旅行系统与社区工具——从数据库到界面，接榫严丝合缝。',
      highlights: ['Node.js', 'React', '数据库设计', 'API 架构'],
    },
  },
  {
    title: 'Systems Architecture',
    description:
      'Scalable, resilient systems that serve real needs — learning platforms, information systems, and organisational dashboards built for reliability and growth.',
    highlights: ['Infrastructure Design', 'System Scalability', 'Data Architecture'],
    zh: {
      title: '系统架构',
      description:
        '可扩展、有韧性、真正解决实际需求的系统——为可靠与成长而建的学习平台、信息系统与机构仪表盘。',
      highlights: ['基础设施设计', '系统可扩展性', '数据架构'],
    },
  },
  {
    title: 'Education Technology',
    description:
      'Deep EdTech expertise that enhances learning at scale. Platforms that hand educators and students accessible, intuitive tools and resources.',
    highlights: ['Learning Platforms', 'Educational Tools', 'EdTech Strategy'],
    zh: {
      title: '教育科技',
      description:
        '深耕教育科技，规模化地改善学习。让教育者与学生随手可用、一看就懂的平台、工具和资源。',
      highlights: ['学习平台', '教学工具', '教育科技战略'],
    },
  },
  {
    title: 'Digital Product Strategy',
    description:
      'Concept to market, end to end. Digital experiences that serve communities — from travel platforms to learning ecosystems to tech director networks.',
    highlights: ['Product Vision', 'Technical Leadership', 'Community Impact'],
    zh: {
      title: '数字产品战略',
      description:
        '从概念到落地，一以贯之。服务社区的数字体验——从旅行平台到学习生态，再到技术主管网络。',
      highlights: ['产品愿景', '技术领导力', '社区影响'],
    },
  },
];

export function competencies(lang: Lang): Competency[] {
  return listInLang(COMPETENCIES_SOURCE, lang);
}

/**
 * How the ecosystem grid is grouped.
 *
 * A flat list of thirteen tiles gave a reader no way in — the Foundation sat
 * next to a safari company with nothing to say how they relate. The groups
 * follow the ecosystem's actual shape rather than a taxonomy invented for the
 * page: the Foundation and its design system, then the three pillars, then the
 * things that fill the commons and the things built on top.
 */
export type ProjectGroup = 'foundation' | 'pillars' | 'commons' | 'community' | 'travel';

export const PROJECT_GROUPS: readonly ProjectGroup[] = [
  'foundation',
  'pillars',
  'commons',
  'community',
  'travel',
];

export const GROUP_LABELS: Record<Lang, Record<ProjectGroup, string>> = {
  en: {
    foundation: 'Foundation & standards',
    pillars: 'The three pillars',
    commons: 'Filling the commons',
    community: 'Community & learning',
    travel: 'Travel',
  },
  zh: {
    foundation: '基金会与标准',
    pillars: '三大支柱',
    commons: '充实共享库',
    community: '社区与学习',
    travel: '旅行',
  },
};

export interface Project {
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly mineral: MineralName;
  readonly group: ProjectGroup;
}

/**
 * The single source of truth for the ecosystem grid on `/`.
 *
 * Project names are proper nouns and are never translated; where a Chinese
 * reader needs a handhold, a short gloss follows the name in parentheses.
 */
const NYUCHI_SOURCE: readonly Bilingual<Project, 'title' | 'description'>[] = [
  {
    title: 'The Bundu Foundation',
    description:
      "The nonprofit researching the standards and open agricultural data commons that Nyuchi, Mukoko and Shamwari AI are building toward — governance in progress, research first",
    href: 'https://bundu.org',
    mineral: 'copper',
    group: 'foundation',
    zh: {
      title: 'The Bundu Foundation（本都基金会）',
      description:
        '这家非营利机构正在研究 Nyuchi、Mukoko 与 Shamwari AI 共同指向的标准与开放农业数据共享库——治理层仍在建设中，研究先行',
    },
  },
  {
    title: 'Mzizi',
    description:
      'The design system the whole ecosystem is built on — seven minerals, Ubuntu doctrine, and an accessibility toolkit, served over an API and an MCP',
    href: 'https://mzizi.dev',
    mineral: 'sodalite',
    group: 'foundation',
    zh: {
      title: 'Mzizi（设计系统）',
      description:
        '整个生态赖以构建的设计系统——七种矿物、乌班图（Ubuntu）准则，以及一套无障碍工具包，通过 API 与 MCP 提供',
    },
  },
  {
    title: 'Nyuchi Africa',
    description:
      'The commercial engine of the ecosystem — web presence, payments and hosting that let African entrepreneurs run a business without a large IT team behind them',
    href: 'https://www.nyuchi.com',
    mineral: 'gold',
    group: 'pillars',
    zh: {
      title: 'Nyuchi Africa',
      description:
        '生态的商业引擎——网站、支付与托管，让非洲创业者不必养一支庞大的 IT 团队也能把生意跑起来',
    },
  },
  {
    title: 'Mukoko',
    description:
      'Privacy-focused social platform bundling 6 everyday apps into one account, instead of juggling tools built for other markets',
    href: 'https://mukoko.com',
    mineral: 'tanzanite',
    group: 'pillars',
    zh: {
      title: 'Mukoko',
      description:
        '注重隐私的社交平台，把 6 款日常应用收进一个账号，不必再周旋于为别处市场设计的工具之间',
    },
  },
  {
    title: 'Shamwari AI',
    description:
      "Nyuchi Africa's open-source initiative for a small, culturally-grounded AI model built to run on affordable, low-bandwidth hardware",
    href: 'https://shamwari.ai',
    mineral: 'sodalite',
    group: 'pillars',
    zh: {
      title: 'Shamwari AI',
      description:
        'Nyuchi Africa 的开源计划：一个植根本土文化的小型 AI 模型，专为廉价、低带宽的硬件而生',
    },
  },
  {
    title: 'Nyuchi StationKit',
    description:
      'Open-source solar-powered weather and soil station for smallholder farmers — from $25, feeding readings into the open commons',
    href: 'https://www.nyuchi.com/stationkit',
    mineral: 'terracotta',
    group: 'commons',
    zh: {
      title: 'Nyuchi StationKit',
      description:
        '面向小农户的开源太阳能气象与土壤监测站——25 美元起，把读数汇入开放共享库',
    },
  },
  {
    title: 'Mukoko Weather',
    description:
      'AI-powered hyperlocal forecasts and advisory for farming, mining and travel, grounded by StationKit sensor data',
    href: 'https://weather.mukoko.com',
    mineral: 'cobalt',
    group: 'commons',
    zh: {
      title: 'Mukoko Weather',
      description:
        '由 AI 驱动的超本地化预报与建议，服务于农业、采矿与出行，底层数据来自 StationKit 的传感器',
    },
  },
  {
    title: 'Mukoko News',
    description:
      "Pan-African news aggregation from trusted regional sources — context instead of international outlets' framing",
    href: 'https://news.mukoko.com',
    mineral: 'cobalt',
    group: 'commons',
    zh: {
      title: 'Mukoko News',
      description: '汇聚可信区域来源的泛非新闻——给出脉络，而不是国际媒体的叙事框架',
    },
  },
  {
    title: 'Nyuchi Learning',
    description:
      'Open-source K-12 digital transformation frameworks, so African schools can modernise without locking into expensive proprietary platforms',
    href: 'https://learning.nyuchi.com',
    mineral: 'malachite',
    group: 'community',
    zh: {
      title: 'Nyuchi Learning',
      description:
        '开源的 K-12 数字化转型框架，让非洲学校无需被昂贵的专有平台绑定也能完成现代化',
    },
  },
  {
    title: 'Nyuchi Lingo',
    description:
      'A language-learning platform for African languages mainstream apps mostly ignore — built to help preserve and spread them',
    href: 'https://lingo.nyuchi.com',
    mineral: 'terracotta',
    group: 'community',
    zh: {
      title: 'Nyuchi Lingo',
      description:
        '主流应用大多忽视的非洲语言，在这里有了自己的学习平台——为保存与传播而建',
    },
  },
  {
    title: 'Nhimbe',
    description:
      'Community events and gatherings, named for the Zimbabwean tradition of neighbours coming together to get work done',
    href: 'https://nhimbe.com',
    mineral: 'copper',
    group: 'community',
    zh: {
      title: 'Nhimbe',
      description: '社区活动与聚会平台，名字取自津巴布韦邻里合力干活的传统',
    },
  },
  {
    title: 'Zimbabwe Travel Info',
    description: 'A practical travel guide for visitors planning a trip to Zimbabwe',
    href: 'https://travel-info.co.zw',
    mineral: 'cobalt',
    group: 'travel',
    zh: {
      title: 'Zimbabwe Travel Info',
      description: '给计划前往津巴布韦的旅行者的实用指南',
    },
  },
  {
    title: 'Iconic Expeditions',
    description: 'Luxury bespoke safaris across Southern and Eastern Africa',
    href: 'https://iconic-expeditions.com',
    mineral: 'gold',
    group: 'travel',
    zh: {
      title: 'Iconic Expeditions',
      description: '横跨非洲南部与东部的高端定制野生动物之旅',
    },
  },
];

const SAS_SOURCE: readonly Bilingual<Project, 'title' | 'description'>[] = [
  {
    title: 'Digital Toolkit',
    description: 'A consistent, supported set of digital tools for staff, instead of ad-hoc solutions per department',
    href: 'https://github.com/SAS-Technology-Innovation/digital-toolkit',
    mineral: 'cobalt',
    group: 'community',
    zh: {
      title: 'Digital Toolkit（数字工具箱）',
      description: '为教职员准备的一套统一且有支持的数字工具，取代各部门各自为政的临时方案',
    },
  },
  {
    title: 'Knowledge Base',
    description:
      'Centralised institutional knowledge — how-tos, policies, processes — that survives staff turnover instead of living in inboxes',
    href: 'https://github.com/SAS-Technology-Innovation/knowledge',
    mineral: 'sodalite',
    group: 'community',
    zh: {
      title: 'Knowledge Base（知识库）',
      description:
        '把操作指引、政策与流程集中沉淀为机构知识，不再散落在收件箱里，人员更替也不会随之流失',
    },
  },
  {
    title: 'Educator Eval',
    description: 'Educator evaluation and assessment, replacing manual, paper-based review cycles',
    href: 'https://github.com/SAS-Technology-Innovation/EducatorEval',
    mineral: 'malachite',
    group: 'community',
    zh: {
      title: 'Educator Eval（教师评估）',
      description: '教师评估与考核平台，取代手工纸质的评审流程',
    },
  },
  {
    title: 'EOI Dashboard',
    description:
      'A live view of expression-of-interest sign-ups, instead of manually collating forms',
    href: 'https://github.com/SAS-Technology-Innovation/Expression-of-Interest-Dashboard',
    mineral: 'tanzanite',
    group: 'community',
    zh: {
      title: 'EOI Dashboard（意向登记看板）',
      description: '实时呈现意向登记情况，不必再人工汇总表单',
    },
  },
];

export function nyuchiProjects(lang: Lang): Project[] {
  return listInLang(NYUCHI_SOURCE, lang);
}

export function sasProjects(lang: Lang): Project[] {
  return listInLang(SAS_SOURCE, lang);
}

/**
 * A project resolved to a language, plus the language-neutral name analytics
 * groups by.
 *
 * The *rendered* title is not stable across languages: a Chinese reader sees
 * "The Bundu Foundation（本都基金会）" and "Mzizi（设计系统）", because a gloss
 * follows the proper noun where it helps. Keying an outbound-click event on
 * what the reader sees would therefore file one project under two names and
 * split its row in every report. The English title is the record's own
 * identity and never varies, so that is the key.
 */
export type KeyedProject = Project & { readonly key: string };

/** The ecosystem grid, grouped in `PROJECT_GROUPS` order. Empty groups drop out. */
export function nyuchiProjectsByGroup(
  lang: Lang,
): { group: ProjectGroup; label: string; projects: KeyedProject[] }[] {
  const projects: KeyedProject[] = NYUCHI_SOURCE.map((entry) => ({
    ...inLang(entry, lang),
    key: entry.title,
  }));

  return PROJECT_GROUPS.map((group) => ({
    group,
    label: GROUP_LABELS[lang][group],
    projects: projects.filter((project) => project.group === group),
  })).filter((section) => section.projects.length > 0);
}
