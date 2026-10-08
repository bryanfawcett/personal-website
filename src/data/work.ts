import type { MineralName } from '../brand/minerals.js';
import type { Bilingual } from '../i18n/localize.js';
import { inLang, listInLang } from '../i18n/localize.js';
import type { Lang } from '../i18n/ui.js';

/**
 * How the ecosystem grid is grouped.
 *
 * A flat list of thirteen tiles gave a reader no way in — the Foundation sat
 * next to a safari company with nothing to say how they relate. The groups
 * follow the ecosystem's actual shape rather than a taxonomy invented for the
 * page: the Foundation and its research, then the four pillars, then the
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
    foundation: 'Foundation & research',
    pillars: 'The four pillars',
    commons: 'Filling the commons',
    community: 'Community & learning',
    travel: 'Zimbabwe & travel',
  },
  zh: {
    foundation: '基金会与研究',
    pillars: '四大支柱',
    commons: '充实共享库',
    community: '社区与学习',
    travel: '津巴布韦与旅行',
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
 * The single source of truth for the ecosystem grid on `/experience`.
 *
 * Project names are proper nouns and are never translated; where a Chinese
 * reader needs a handhold, a short gloss follows the name in parentheses.
 */
const NYUCHI_SOURCE: readonly Bilingual<Project, 'title' | 'description'>[] = [
  {
    title: 'The Bundu Foundation',
    description:
      'A Zimbabwean research foundation, a company limited by guarantee. Research into the infrastructure gaps in informal and formal markets across Africa comes first, and it governs the four pillars below and its own open-source projects',
    href: 'https://bundu.org',
    mineral: 'copper',
    group: 'foundation',
    zh: {
      title: 'The Bundu Foundation（本都基金会）',
      description:
        '一家津巴布韦研究型基金会（担保有限公司）。研究先行——研究非洲非正规与正规市场中的基础设施缺口；它统辖下面四大支柱，以及基金会自己的开源项目',
    },
  },
  {
    title: 'Mzizi',
    description:
      "A programming-language research project that writes a product's rules into its code, and publishes every test run, including the two pilots that showed no advantage yet",
    href: 'https://mzizi.dev',
    mineral: 'sodalite',
    group: 'foundation',
    zh: {
      title: 'Mzizi（编程语言研究）',
      description:
        '一个编程语言研究项目：把产品必须遵守的规则写进代码本身，并公开每一次测试——包括两次尚未显示出优势的试点',
    },
  },
  {
    title: 'Bundu Labs',
    description:
      'The research pillar: infrastructure gaps studied, published as open standards and frameworks, then built into products Nyuchi and Mukoko run',
    href: 'https://www.bundu.org/research',
    mineral: 'copper',
    group: 'pillars',
    zh: {
      title: 'Bundu Labs（本都实验室）',
      description:
        '研究支柱：研究基础设施缺口，以开放标准与框架的形式发布，再落地为 Nyuchi 与 Mukoko 运营的产品',
    },
  },
  {
    title: 'Nyuchi Africa',
    description:
      'The commercial pillar: custom software, weather stations and an API platform for organisations in informal and formal markets, whose people work on slow connections, shared phones and in more than one language',
    href: 'https://www.nyuchi.com',
    mineral: 'gold',
    group: 'pillars',
    zh: {
      title: 'Nyuchi Africa',
      description:
        '商业支柱：为非正规与正规市场中、在慢速网络、共用手机、多种语言环境下工作的机构，提供定制软件、气象站与 API 平台',
    },
  },
  {
    title: 'Mukoko',
    description:
      'The consumer pillar: a super-app of everyday tools, from messaging and news to events and weather, with one identity across all of them',
    href: 'https://mukoko.com',
    mineral: 'tanzanite',
    group: 'pillars',
    zh: {
      title: 'Mukoko',
      description:
        '消费者支柱：一个汇集日常工具的超级应用，从消息、新闻到活动与天气，所有应用共用同一个身份',
    },
  },
  {
    title: 'Shamwari AI',
    description:
      'The community pillar: a companion that answers in Shona, Ndebele and English, and cites its sources rather than guessing',
    href: 'https://shamwari.ai',
    mineral: 'sodalite',
    group: 'pillars',
    zh: {
      title: 'Shamwari AI',
      description: '社区支柱：一个用绍纳语、恩德贝莱语和英语作答的伙伴，引用出处而不是凭空猜测',
    },
  },
  {
    title: 'Nyuchi StationKit',
    description:
      'A solar weather and soil station for smallholder farms, from $25 for the basic kit (indicative price), with its readings feeding the open data commons',
    href: 'https://www.nyuchi.com/stationkit',
    mineral: 'terracotta',
    group: 'commons',
    zh: {
      title: 'Nyuchi StationKit',
      description:
        '面向小农户的太阳能气象与土壤监测站，基础套件 25 美元起（参考价），读数汇入开放数据共享库',
    },
  },
  {
    title: 'Mukoko Weather',
    description:
      "Forecasts and frost alerts for farming regions, mining areas, border posts and travel routes, with advice for the day's work",
    href: 'https://weather.mukoko.com',
    mineral: 'cobalt',
    group: 'commons',
    zh: {
      title: 'Mukoko Weather',
      description: '为农区、矿区、边境口岸与出行路线提供预报与霜冻预警，并附上当天如何安排工作的建议',
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
      'Training programmes, the open Bundu Education frameworks, and the classroom tools Nyuchi builds for schools',
    href: 'https://learning.nyuchi.com',
    mineral: 'malachite',
    group: 'community',
    zh: {
      title: 'Nyuchi Learning',
      description: '培训课程、开放的 Bundu Education 框架，以及 Nyuchi 为学校打造的课堂工具',
    },
  },
  {
    title: 'Toddle Enhancement Extension',
    description:
      'A Chrome extension for schools on Toddle, built by Nyuchi: every rubric criterion as its own gradebook column, CSV export, and a free switch that conceals student flags before a screen is shared. It reads Toddle, writes nothing, and sends student data nowhere. Singapore American School helps maintain it and uses it free of charge',
    href: 'https://learning.nyuchi.com/toddle-enhancement-extension',
    mineral: 'malachite',
    group: 'community',
    zh: {
      title: 'Toddle Enhancement Extension（Toddle 增强扩展）',
      description:
        '为使用 Toddle 的学校打造的 Chrome 扩展：每条评分标准都成为成绩册中独立的一列，可导出 CSV，并有一个免费开关，在共享屏幕前隐藏学生标记。它只读取 Toddle，不写入任何内容，也不把学生数据发往任何地方。Singapore American School（新加坡美国学校）协助维护，并免费使用',
    },
  },
  {
    title: 'Mukoko Lingo',
    description:
      'Learning the African languages mainstream apps mostly ignore, with Shona and Ndebele first',
    href: 'https://lingo.mukoko.com',
    mineral: 'terracotta',
    group: 'community',
    zh: {
      title: 'Mukoko Lingo',
      description: '学习主流应用大多忽视的非洲语言，以绍纳语和恩德贝莱语为先',
    },
  },
  {
    title: 'Mukoko Events',
    description:
      'Community gatherings, hosted and found in one place. It grew out of nhimbe, the Shona tradition of neighbours coming together to get work done',
    href: 'https://events.mukoko.com',
    mineral: 'copper',
    group: 'community',
    zh: {
      title: 'Mukoko Events',
      description: '在同一处发起和找到社区聚会。它源自 nhimbe——绍纳人邻里合力干活的传统',
    },
  },
  {
    title: 'Zimbabwe Information Platform',
    description:
      'A Foundation initiative: verified directories, and travel and business information for anyone visiting or working in Zimbabwe',
    href: 'https://travel-info.co.zw',
    mineral: 'cobalt',
    group: 'travel',
    zh: {
      title: 'Zimbabwe Information Platform（津巴布韦信息平台）',
      description: '基金会直属项目：经过核验的名录，以及面向赴津旅行或工作者的出行与商务信息',
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
 * "The Bundu Foundation（本都基金会）" and "Mzizi（编程语言研究）", because a gloss
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

/*
 * ------------------------------------------------------------------------
 * The home page: one visitor, one action.
 *
 * The home sheet is written for an organisation deciding whether to hire
 * Nyuchi, and everything on it is there to get a scoping call booked. The
 * full ecosystem grid lives on /experience, where a reader who wants the
 * whole picture can find it without it standing between a buyer and the
 * button.
 *
 * Every claim below is one a live site makes today. Where proof is still
 * missing (user numbers, client names, quotes) the copy says less rather
 * than guessing; add the figure here when it exists, not before.
 * ------------------------------------------------------------------------
 */

/** A problem an organisation recognises, stated as the people who have it. */
export interface Audience {
  readonly title: string;
  readonly body: string;
  readonly mineral: MineralName;
}

const AUDIENCE_SOURCE: readonly Bilingual<Audience, 'title' | 'body'>[] = [
  {
    title: 'Teams who work where the signal drops',
    body: "Field officers, inspectors and outreach staff. What they enter saves on the phone and syncs when the network comes back, so a day's work is never lost at the edge of coverage.",
    mineral: 'cobalt',
    zh: {
      title: '在信号时有时无处工作的团队',
      body: '外勤人员、巡查员、外展工作者。录入的内容先存在手机上，网络恢复后再同步——一天的工作不会因为走到覆盖边缘而丢失。',
    },
  },
  {
    title: 'Services where five people share one phone',
    body: 'Clinics, schools and households. Switching accounts is quick, and nothing punishes someone for the device they can afford.',
    mineral: 'terracotta',
    zh: {
      title: '五个人共用一部手机的服务',
      body: '诊所、学校、家庭。切换账号又快又简单，也不会因为一个人买得起什么设备而亏待他。',
    },
  },
  {
    title: 'People who read Shona or Ndebele first',
    body: 'English, Shona and Ndebele built in from the first screen, not translated at the end, with type that stays readable in midday sun.',
    mineral: 'malachite',
    zh: {
      title: '首先读绍纳语或恩德贝莱语的人',
      body: '英语、绍纳语、恩德贝莱语从第一屏就内建其中，而不是最后才翻译；字体在正午的阳光下依然清晰可读。',
    },
  },
];

export function audiences(lang: Lang): Audience[] {
  return listInLang(AUDIENCE_SOURCE, lang);
}

export interface SystemLink {
  readonly label: string;
  readonly href: string;
}

/**
 * Three systems, one per place the work happens.
 *
 * Each card answers the same three questions in the same order: who it is
 * for, how the parts connect, and what that changed. Systems thinking is
 * shown by the parts and the connections, never claimed in an adjective.
 */
export interface SystemCard {
  readonly org: string;
  readonly title: string;
  readonly people: string;
  readonly system: string;
  readonly result: string;
  readonly links: readonly SystemLink[];
  readonly mineral: MineralName;
}

const SYSTEMS_SOURCE: readonly Bilingual<
  SystemCard,
  'org' | 'title' | 'people' | 'system' | 'result' | 'links'
>[] = [
  {
    org: 'Singapore American School',
    title: 'One process for a whole school',
    people: 'Teachers, school leaders, and the staff who keep a school running.',
    system:
      "The Digital Toolkit sets one central, school-wide process for the tools staff use, in place of each department's own workarounds. Around it: a Knowledge Base that keeps how-tos and policy when staff move on, an evaluation app that replaces paper review cycles, and a live dashboard for programme sign-ups.",
    result:
      'Each one replaced something done by hand, and each is built knowing what it plugs into, because I have worked every layer of the same school: application systems, infrastructure, privacy and governance, and now innovation.',
    links: [
      { label: 'The repositories', href: 'https://github.com/SAS-Technology-Innovation' },
    ],
    mineral: 'cobalt',
    zh: {
      org: 'Singapore American School（新加坡美国学校）',
      title: '整所学校，一套流程',
      people: '教师、学校管理者，以及让学校正常运转的教职员。',
      system:
        '数字工具箱为全校教职员所用的工具确立了一套统一的中心流程，取代各部门各自为政的变通办法。围绕它的还有：一个知识库，让操作指引与政策在人员更替后依然留存；一个评估应用，取代纸质评审流程；以及一块实时的项目报名看板。',
      result:
        '每一个都取代了某件原本靠手工完成的事；每一个在建造时都清楚自己要接入什么——因为同一所学校的每一层我都做过：应用系统、基础设施、隐私与治理，以及如今的创新。',
      links: [{ label: '代码库', href: 'https://github.com/SAS-Technology-Innovation' }],
    },
  },
  {
    org: 'Nyuchi Africa',
    title: 'From weather station to farmer',
    people: 'Smallholder farmers, mine operators, and people on the road.',
    system:
      'A solar weather and soil station (StationKit, from $25 for the basic kit), a console where the people hosting stations register them and watch their battery health, and Mukoko Weather, which turns forecasts into frost alerts and advice for the day.',
    result:
      'Forecasts for farming regions, mining areas, border posts and national parks across Zimbabwe and beyond, built to the same rules as every Nyuchi product: usable on a slow connection, readable outdoors.',
    links: [
      { label: 'Mukoko Weather', href: 'https://weather.mukoko.com' },
      { label: 'StationKit', href: 'https://www.nyuchi.com/stationkit' },
    ],
    mineral: 'gold',
    zh: {
      org: 'Nyuchi Africa',
      title: '从气象站到农户',
      people: '小农户、矿场运营者，以及在路上的人。',
      system:
        '一座太阳能气象与土壤监测站（StationKit，基础套件 25 美元起），一个供站点托管者登记设备、查看电池状况的控制台，以及 Mukoko Weather——把预报变成霜冻预警和当天的行动建议。',
      result:
        '为津巴布韦及更远处的农区、矿区、边境口岸与国家公园提供预报，并遵循每一款 Nyuchi 产品共同的规则：慢速网络下可用，户外阳光下可读。',
      links: [
        { label: 'Mukoko Weather', href: 'https://weather.mukoko.com' },
        { label: 'StationKit', href: 'https://www.nyuchi.com/stationkit' },
      ],
    },
  },
  {
    org: 'The Bundu Foundation & Mzizi',
    title: 'Rules that hold across every product',
    people: 'Every team building in the Bundu ecosystem, and the people their products serve.',
    system:
      "The Foundation sets the standards, Nyuchi and Mukoko build to them, and Mzizi writes them into the code. Nyuchi's rule is large touch targets, so an app works outdoors on a small phone; in Mzizi, a button's minimum 48px height is part of the button's own definition, and a change that breaks it fails the check before it can ship.",
    result:
      'Mzizi publishes every test run, including the two pilots that showed no advantage yet, and set the bar it must clear before the decisive run, not after. Measured, and said as it is.',
    links: [
      { label: 'mzizi.dev', href: 'https://mzizi.dev' },
      { label: 'bundu.org', href: 'https://bundu.org' },
    ],
    mineral: 'copper',
    zh: {
      org: 'The Bundu Foundation 与 Mzizi',
      title: '在每一款产品中都成立的规则',
      people: '在 Bundu 生态中构建的每一个团队，以及他们的产品所服务的人。',
      system:
        '基金会制定标准，Nyuchi 与 Mukoko 按标准构建，Mzizi 把标准写进代码。Nyuchi 的规则是足够大的触控区域，让应用在户外、在小屏手机上也好用；在 Mzizi 中，按钮最少 48px 的高度是按钮定义本身的一部分，任何违反它的改动在发布之前就无法通过检查。',
      result:
        'Mzizi 公开每一次测试，包括两次尚未显示出优势的试点；它必须跨过的门槛在决定性测试之前就已定下，而不是事后。量过，再如实说出来。',
      links: [
        { label: 'mzizi.dev', href: 'https://mzizi.dev' },
        { label: 'bundu.org', href: 'https://bundu.org' },
      ],
    },
  },
];

export function systems(lang: Lang): SystemCard[] {
  return listInLang(SYSTEMS_SOURCE, lang);
}

/** How a commission runs: measure twice, ship once. */
export interface Step {
  readonly title: string;
  readonly body: string;
}

const STEPS_SOURCE: readonly Bilingual<Step, 'title' | 'body'>[] = [
  {
    title: 'Measure',
    body: 'A free 30-minute call. Who will use it, what it runs on, where the data goes, and what breaks when the signal drops.',
    zh: {
      title: '测量',
      body: '一次 30 分钟的免费通话。谁会用它、它跑在什么上面、数据流向哪里、信号一断会坏掉什么。',
    },
  },
  {
    title: 'Draw',
    body: 'A written scope and a quote before any code is written, so you know what you are getting and what it will cost.',
    zh: {
      title: '绘图',
      body: '在写下任何代码之前，先给出书面范围与报价——你清楚会得到什么，也清楚要花多少。',
    },
  },
  {
    title: 'Build',
    body: 'Nyuchi Web Services builds it in Harare, and you see working software as it takes shape, not a slide deck at the end.',
    zh: {
      title: '建造',
      body: '由 Nyuchi Web Services 在哈拉雷建造；你看到的是一步步成形、能运行的软件，而不是最后的一套幻灯片。',
    },
  },
  {
    title: 'Hand over',
    body: 'Documentation your team can use, then your choice: run it yourselves, or have us maintain it.',
    zh: {
      title: '交付',
      body: '交付你的团队用得上的文档，然后由你选择：自己运行，或交给我们维护。',
    },
  },
];

export function steps(lang: Lang): Step[] {
  return listInLang(STEPS_SOURCE, lang);
}
