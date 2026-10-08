/**
 * The site in two languages.
 *
 * Scope: this file holds *chrome* — navigation, section labels, figure tags,
 * captions, buttons and per-page metadata. Prose that belongs to a subject
 * (a project's description, a role's bullets, a mineral's meaning) stays in
 * `src/data/`, next to the rest of that record, and carries its own `zh`
 * block. Splitting it the other way would give the ecosystem grid two sources
 * of truth, and `src/data/work.ts` is meant to be the only one.
 *
 * Proper nouns are never translated. Nyuchi, Mukoko, Bundu, Shamwari, Mzizi
 * and SAS stay in Latin script; where a reader needs a handhold, a
 * short Chinese gloss follows in parentheses on first use rather than
 * replacing the name.
 */

export const languages = {
  en: 'English',
  zh: '中文',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'en';

/** `zh` reads left-to-right too, but the attribute is set explicitly. */
export const direction: Record<Lang, 'ltr' | 'rtl'> = {
  en: 'ltr',
  zh: 'ltr',
};

/** BCP 47 tags for `hreflang` and `og:locale`. */
export const bcp47: Record<Lang, string> = {
  en: 'en',
  zh: 'zh-Hans',
};

export const ogLocale: Record<Lang, string> = {
  en: 'en_US',
  zh: 'zh_CN',
};

export const ui = {
  en: {
    // --- global chrome ---
    'nav.label': 'Main',
    'nav.footer': 'Footer',
    'nav.profile': 'Profile',
    'nav.experience': 'Experience',
    'nav.adventures': 'Adventures',
    'nav.origins': 'Origins',
    'nav.minerals': 'Minerals',
    'nav.book': 'Book a Call',
    'nav.switch_lang': '中文',
    'nav.switch_lang_label': 'Switch to Chinese',
    'nav.skip': 'Skip to main content',
    'nav.portrait_alt': 'Bryan Fawcett, photographed',

    // --- title block ---
    'tb.label': 'Title block',
    'tb.project': 'Project',
    'tb.drawn_by': 'Drawn by',
    'tb.sheet': 'Sheet',
    'tb.rev': 'Rev',

    // --- home ---
    'home.eyebrow': 'Builder of communities · Harare → Singapore · since 2012',
    'home.solid': 'Digital',
    'home.drafted': 'Craftsman',
    'home.sub':
      'I design for how people, data, tools and constraints connect, not single features. Through The Bundu Foundation and Nyuchi Africa, I research and build for informal and formal markets, for organisations whose people work offline, outdoors and in more than one language.',
    'home.cta_primary': 'Book a scoping call',
    'home.cta_secondary': 'See the systems',
    'home.note': 'measure twice,\nship once',
    'home.dimension': 'Drawn to scale',

    'home.strip_label': 'Workshop views',
    'home.strip_a': 'Harare, ZW',
    'home.strip_b': 'Singapore',
    'home.strip_c': 'The workbench',

    'home.who_eyebrow': 'Sheet 01 · Who we build for',
    'home.who_note': 'the people, first',
    'home.who_heading': 'Who we build for',

    'home.systems_eyebrow': 'Sheet 02 · Three systems',
    'home.systems_note': 'the whole drawing, not one part',
    'home.systems_heading': 'Three systems, and how their parts connect',
    'home.systems_fig': 'Fig.',
    'home.systems_people': 'For',
    'home.systems_system': 'The system',
    'home.systems_result': 'What changed',

    'home.steps_eyebrow': 'Sheet 03 · How a job runs',
    'home.steps_note': 'the same four steps, every time',
    'home.steps_heading': 'How a job runs',
    'home.steps_fig': 'Step',

    'home.quote_fig': 'Message from the bench',
    'home.quote_heading': 'Message from the bench',
    'home.quote_before': '“It doesn’t matter where you start — it’s what you ',
    'home.quote_build': 'build',
    'home.quote_middle': ' from there, and ',
    'home.quote_who': 'who',
    'home.quote_after': ' you build it with.”',
    'home.quote_sig': '— Bryan',

    'home.bigger_fig': 'Fig. 04 — The wider drawing',
    'home.bigger_heading': 'Where Nyuchi sits',
    'home.bigger_body':
      'Nyuchi Africa is the commercial pillar of The Bundu Foundation, a Zimbabwean foundation that researches the infrastructure gaps in informal and formal markets and governs four pillars: Bundu Labs for research, Mukoko for consumers, Nyuchi for organisations, and Shamwari AI for community. What the research finds goes into the standards every pillar is held to.',
    'home.bigger_all': 'All projects',
    'home.bigger_bundu': 'bundu.org',

    'home.connect_fig': 'Fig. 05 — Commission',
    'home.connect_stamp': 'Now booking',
    'home.connect_heading': 'Bring the drawing',
    'home.connect_lede':
      'If your people work offline, outdoors or in more than one language, start with a free 30-minute call. You will leave with a clearer picture of the system, whether or not you hire us.',
    'home.connect_cta': 'Book a scoping call',

    // --- contact card ---
    'card.fig': 'Fig. 00 — The draughtsman',
    'card.scan': 'Scan to save',
    'card.download': 'Download .vcf',

    // --- experience ---
    'exp.eyebrow': 'Sheet 02 · At the bench',
    'exp.title': 'Experience',
    'exp.lede':
      'Over ten years in education technology, systems architecture, and digital product development across Africa and Asia.',
    'exp.note': 'every joint, dated',
    'exp.roles_heading': 'Work history',
    'exp.credentials_eyebrow': 'Schedule B · Credentials',
    'exp.credentials_heading': 'Education and certifications',
    'exp.skills_eyebrow': 'Schedule C · Toolkit',
    'exp.skills_heading': 'Core skills',
    'exp.ecosystem_eyebrow': 'Schedule D · Everything at the bench',
    'exp.ecosystem_heading': 'Projects and work',
    'exp.ecosystem_group': 'The Bundu Ecosystem',
    'exp.ecosystem_lede':
      'The Bundu Foundation is a Zimbabwean research foundation, and research into infrastructure gaps in informal and formal markets comes first. It governs four pillars: Bundu Labs, Nyuchi Africa, Mukoko and Shamwari AI. Below, what each builds, linked to the live site.',
    'exp.ecosystem_sas': 'Singapore American School',
    'exp.ecosystem_visit': 'Visit →',
    'exp.ecosystem_repo': 'Repository →',

    // --- origins ---
    'origins.eyebrow': 'Sheet 04 · Off the bench',
    'origins.title': 'Origins with a Perspective on Human Potential',
    'origins.lede':
      'Equity: the assumptions we make in learning. Where I came from, where education itself began, and the gap between what we say we value and what we actually measure.',
    'origins.note': 'questions, not answers',
    'origins.description':
      'Equity and the assumptions we make in learning — what growing up in Zimbabwe taught me about measuring capability instead of credentials, and how that shapes the technology work I do now.',
    'origins.open_deck': 'Open the presentation',

    'origins.why_eyebrow': 'Why this exists',
    'origins.why_heading': 'The lens I bring',
    'origins.why_p1':
      'I work in technology at an international school. Most of my colleagues know me as the person who fixes things, rolls out systems, and lately introduces AI tools. That is a fair description of the job. It is not a complete description of the lens I bring to it.',
    'origins.why_p2_before':
      'I am from Zimbabwe — for a long stretch, the only person on my team who is a citizen of a country outside the first world. Growing up there in the nineties and two-thousands taught me something that has never left me: ',
    'origins.why_p2_em':
      'skills meant survival and success, not grades or the name of a good school.',
    'origins.why_p2_after':
      ' When infrastructure fails on a schedule, when the problems in front of you are not in any textbook, when innovation is the difference between thriving and merely getting by, you end up with a different working definition of intelligence.',
    'origins.why_p3':
      'So when our school turned its equity lens on the assumptions we make about students, I wanted to bring that definition into the room. Not as a critique — as a question I genuinely cannot answer alone.',

    'origins.argument_eyebrow': 'The argument',
    'origins.argument_heading': 'Capability over credentials',
    'origins.argument_p1':
      'In Zimbabwe, you succeeded on what you could actually do — adapt, collaborate, solve the unexpected — rather than by following the well-lit path of good grades to good college to good job. Capability mattered more than credentials, because credentials alone did not keep the lights on.',
    'origins.argument_p2':
      'That made me curious about education’s own origins. The great centres of learning, from Alexandria to the Renaissance academies, evaluated scholars on their ability to contribute new knowledge, argue well, and solve genuinely hard problems. Not on recall under artificial time pressure.',
    'origins.argument_pull':
      'When did we shift from cultivating intellectual excellence to measuring test-taking ability?',
    'origins.argument_p3':
      'Here is the tension I keep running into in my own work: I am helping introduce technologies that handle information recall instantly, while we still often assess students on their ability to memorise information under time pressure. Both things are true at once, and I do not think we have fully reckoned with that.',

    'origins.journey_eyebrow': 'The path here',
    'origins.journey_heading': 'How I got here',
    'origins.journey_lede':
      'Zimbabwe to South Africa to Japan to Singapore. Classroom to server room to strategy — which is why I keep asking questions that sit awkwardly between all three.',

    'origins.now_eyebrow': 'Now',
    'origins.now_heading': 'What I’m working on',
    'origins.now_lede':
      'Two halves of the same question — one inside a school, one across a continent.',
    'origins.now_sas': 'Singapore American School',
    'origins.now_nyuchi': 'Nyuchi Africa',
    'origins.now_aside':
      'The Nyuchi work was built for places where credentials were never the thing that got you through. That is the same instinct I bring to the work at school.',

    'origins.pink_eyebrow': 'The Conceptual Age',
    'origins.pink_heading': 'Six aptitudes',
    'origins.pink_p1_before': 'Daniel Pink’s ',
    'origins.pink_p1_link': 'A Whole New Mind',
    'origins.pink_p1_after':
      ' argues that abundance, automation and Asia have moved the premium away from logical, linear, spreadsheet work and toward what he calls high concept and high touch — the abilities that are hard to outsource and hard to automate.',
    'origins.pink_p2':
      'What struck me reading it is that these are the skills that drove success in Zimbabwe out of necessity. The Conceptual Age is not a forecast for me. It is a description of where I grew up.',

    'origins.questions_eyebrow': 'Open',
    'origins.questions_heading': 'The questions that matter',
    'origins.questions_lede':
      'I don’t have answers — just questions from someone seeing the work through a different lens.',
    'origins.questions_pull':
      'Are there brilliant minds we’re missing because we’re measuring the wrong things?',

    'origins.deck_eyebrow': 'The deck',
    'origins.deck_heading': 'The presentation',
    'origins.deck_lede': 'The original scrolling deck, as it was delivered. It reads best full screen.',
    'origins.deck_iframe_title': 'Origins with a Perspective on Human Potential — presentation',
    'origins.deck_fullscreen': 'Open full screen',

    'origins.cta_heading': 'What have you noticed?',
    'origins.cta_lede':
      'If you work in education, assessment, or anywhere the gap between capability and credentials shows up — I’d like to hear how it looks from where you sit.',
    'origins.cta_book': 'Book a call',

    // --- minerals ---
    'minerals.eyebrow': 'Sheet 05 · Legend',
    'minerals.title': 'The mineral rail',
    'minerals.description':
      'Seven minerals from across Africa, one per segment of the rail down the edge of every page — what each stands for, where it is mined, and how it is used. Drawn from Mzizi’s brand system.',
    'minerals.lede':
      'Seven segments run down the binding edge of every page on this site. Each is a mineral mined in Africa, and each carries a meaning the interface actually uses. This is the key.',
    'minerals.note': 'read the edge',
    'minerals.why_fig': 'Fig. 01 — Why stones',
    'minerals.why_heading': 'Why stones, and not a palette',
    'minerals.why_p1_before': 'A palette named ',
    'minerals.why_p1_primary': 'primary',
    'minerals.why_p1_secondary': 'secondary',
    'minerals.why_p1_accent': 'accent',
    'minerals.why_p1_sep1': ', ',
    'minerals.why_p1_sep2': ' and ',
    'minerals.why_p1_mid':
      ' tells you where a colour goes and nothing about why it exists. The ',
    'minerals.why_p1_link': 'Mzizi brand system',
    'minerals.why_p1_after':
      ' names its colours after minerals mined across the continent, and keeps the provenance attached: where the stone comes from, what it stands for, what it is for in an interface.',
    'minerals.why_p2':
      'That provenance is the point. Cobalt out of Katanga is in the phone you are reading this on. Naming the link colour after it is a small refusal to treat the material as abstract.',
    'minerals.why_p3_before': 'Mzizi is a ',
    'minerals.why_p3_nyuchi': 'nyuchi',
    'minerals.why_p3_mid':
      ' project in the Bundu ecosystem, built on the Ubuntu principle that gives the whole thing its shape — ',
    'minerals.why_p3_ubuntu': 'I am because we are',
    'minerals.why_p3_after': '. Its brand system, tokens and accessibility toolkit are at ',
    'minerals.why_p3_end': '.',

    'minerals.key_eyebrow': 'Sheet 05 · The seven',
    'minerals.key_note': 'top to bottom',
    'minerals.key_heading': 'The seven minerals',
    'minerals.key_means': 'Means',
    'minerals.key_mined': 'Mined in',
    'minerals.key_used': 'Used for',

    'minerals.a11y_fig': 'Fig. 02 — Accessibility',
    'minerals.a11y_heading': 'Every one of them, measured',
    'minerals.a11y_p1_before':
      'The ratios above are WCAG 2.2 contrast against this site’s ground (',
    'minerals.a11y_p1_after':
      '), computed at build time from the same tokens the rail draws with. They are not claims copied off a swatch sheet — if a token changes, the number on this page changes with it.',
    'minerals.a11y_p2_before':
      'Mzizi ships the checking as part of the system rather than leaving it to each consumer: contrast against its APCA and AAA floors, plus colour-vision simulation, available in the toolkit at ',
    'minerals.a11y_p2_after':
      ' and over its MCP server, so an agent building against the system can verify a pairing before it ships it.',
    'minerals.a11y_p3_before': 'On this site the minerals are a ',
    'minerals.a11y_p3_nontext': 'non-text',
    'minerals.a11y_p3_mid':
      ' mark, so the bar they have to clear is WCAG 2.2 SC 1.4.11 at 3:1 — which every one of the seven does. Colour is never the only carrier of meaning here: the rail is ',
    'minerals.a11y_p3_after':
      ', every segment names itself on hover, and this page is the text alternative.',

    // --- book ---
    'book.eyebrow': 'Sheet 06 · Commission',
    'book.title': 'Book a call',
    'book.description':
      'Book a call with Bryan Fawcett to scope a build with Nyuchi Africa, or to talk about EdTech, systems architecture, and building for African communities.',
    'book.lede':
      'Bring the drawing, however rough. We will work out who it is for, what it runs on and where it breaks, then whether Nyuchi is the right team to build it.',
    'book.note': 'bring the drawing',
    'book.topics_eyebrow': 'What to expect',
    'book.topics_heading': 'Worth talking about',
    'book.scheduling_eyebrow': 'Scheduling',
    'book.scheduling_heading': 'Pick a time',
    'book.load': 'Load the scheduler',
    'book.fallback': 'Prefer email?',
    'book.error': 'The scheduler could not load. Email bryan@nyuchi.com instead.',

    // --- adventures ---
    'adv.title': 'Bryan’s Adventures',
    'adv.eyebrow': 'Sheet 03 · Field notes',
    'adv.note': 'written in the field',
    'adv.lede':
      'Long drives, bad maps and the places at the end of them. Mostly southern Africa, occasionally further.',
    'adv.description':
      'Travel writing by Bryan Fawcett — long drives, bad maps and the places at the end of them, mostly across southern Africa.',
    'adv.heading': 'Every adventure',
    'adv.read': 'Read →',
    'adv.back': '← All adventures',
    'adv.english_only': 'English only',
    'adv.english_only_title': 'Not translated yet — this one opens in English',
    'adv.empty_title': 'Nothing written up yet',
    'adv.empty_body':
      'The first adventure is still in a notebook somewhere. Check back, or come and talk to me in the meantime.',
    'adv.unavailable_title': 'The adventures are not loading',
    'adv.unavailable_body':
      'The writing lives in a content service that is not answering right now. It is not gone — try again in a few minutes.',
    'adv.missing_title': 'No such adventure',
    'adv.missing_body': 'This one may have been renamed, or the link may be old.',

    // --- 404 ---
    'nf.title': 'Sheet not found',
    'nf.description': 'That page does not exist on bryanfawcett.com.',
    'nf.eyebrow': '404 · Sheet missing',
    'nf.heading': 'Not on this drawing',
    'nf.lede': 'The link may be old, or the reference slightly off.',
    'nf.note': 'check the index',
  },

  zh: {
    // --- global chrome ---
    'nav.label': '主导航',
    'nav.footer': '页脚导航',
    'nav.profile': '简介',
    'nav.experience': '项目经验',
    'nav.adventures': '游记',
    'nav.origins': '本源',
    'nav.minerals': '矿物',
    'nav.book': '预约通话',
    'nav.switch_lang': 'English',
    'nav.switch_lang_label': '切换到英文',
    'nav.skip': '跳到主要内容',
    'nav.portrait_alt': 'Bryan Fawcett 本人照片',

    // --- title block ---
    'tb.label': '图签栏',
    'tb.project': '项目',
    'tb.drawn_by': '制图',
    'tb.sheet': '图号',
    'tb.rev': '版次',

    // --- home ---
    'home.eyebrow': '社区的建造者 · 哈拉雷 → 新加坡 · 自 2012 年起',
    'home.solid': '数字',
    'home.drafted': '工匠',
    'home.sub':
      '我设计的不是单个功能，而是人、数据、工具与约束之间如何相连。通过 The Bundu Foundation 与 Nyuchi Africa，我为非正规与正规市场做研究、做建造，服务那些在离线、户外、多语言环境中工作的机构。',
    'home.cta_primary': '预约需求梳理通话',
    'home.cta_secondary': '看看这些系统',
    'home.note': '量两次，\n出一次',
    'home.dimension': '按比例绘制',

    'home.strip_label': '工作室视图',
    'home.strip_a': '津巴布韦 哈拉雷',
    'home.strip_b': '新加坡',
    'home.strip_c': '工作台',

    'home.who_eyebrow': '图 01 · 为谁而建',
    'home.who_note': '先看人',
    'home.who_heading': '为谁而建',

    'home.systems_eyebrow': '图 02 · 三个系统',
    'home.systems_note': '看整张图，而不是一个零件',
    'home.systems_heading': '三个系统，以及它们的部件如何相连',
    'home.systems_fig': '图',
    'home.systems_people': '服务对象',
    'home.systems_system': '系统',
    'home.systems_result': '带来的改变',

    'home.steps_eyebrow': '图 03 · 一项工作如何进行',
    'home.steps_note': '每一次，都是这四步',
    'home.steps_heading': '一项工作如何进行',
    'home.steps_fig': '步骤',

    'home.quote_fig': '匠人寄语',
    'home.quote_heading': '匠人寄语',
    'home.quote_before': '「起点在哪里并不重要——重要的是你由此',
    'home.quote_build': '构建',
    'home.quote_middle': '了什么，以及你',
    'home.quote_who': '与谁',
    'home.quote_after': '并肩共建。」',
    'home.quote_sig': '——Bryan',

    'home.bigger_fig': '图 04 — 更大的图纸',
    'home.bigger_heading': 'Nyuchi 的位置',
    'home.bigger_body':
      'Nyuchi Africa 是 The Bundu Foundation（本都基金会）的商业支柱。这家津巴布韦基金会研究非正规与正规市场中的基础设施缺口，并统辖四大支柱：负责研究的 Bundu Labs、面向消费者的 Mukoko、面向机构的 Nyuchi，以及面向社区的 Shamwari AI。研究的发现，会写进每一个支柱都须遵守的标准。',
    'home.bigger_all': '全部项目',
    'home.bigger_bundu': 'bundu.org',

    'home.connect_fig': '图 05 — 委托',
    'home.connect_stamp': '接受委托',
    'home.connect_heading': '带上你的图纸',
    'home.connect_lede':
      '如果你的团队在离线、户外或多语言的环境中工作，先从一次 30 分钟的免费通话开始。无论最后是否委托我们，你都会对整个系统看得更清楚。',
    'home.connect_cta': '预约需求梳理通话',

    // --- contact card ---
    'card.fig': '图 00 — 制图人',
    'card.scan': '扫码保存名片',
    'card.download': '下载 .vcf',

    // --- experience ---
    'exp.eyebrow': '图 02 · 在工作台前',
    'exp.title': '项目经验',
    'exp.lede': '十余年深耕教育科技、系统架构与数字产品开发，足迹遍及非洲与亚洲。',
    'exp.note': '每一处接榫，皆有年月',
    'exp.roles_heading': '工作履历',
    'exp.credentials_eyebrow': '附表 B · 学历与认证',
    'exp.credentials_heading': '教育背景与专业认证',
    'exp.skills_eyebrow': '附表 C · 工具箱',
    'exp.skills_heading': '核心技能',
    'exp.ecosystem_eyebrow': '附表 D · 工作台上的一切',
    'exp.ecosystem_heading': '作品与项目',
    'exp.ecosystem_group': 'Bundu 生态（本都生态）',
    'exp.ecosystem_lede':
      'The Bundu Foundation（本都基金会）是一家津巴布韦研究型基金会，对非正规与正规市场中基础设施缺口的研究先行。它统辖四大支柱：Bundu Labs、Nyuchi Africa、Mukoko 与 Shamwari AI。以下是各自在做的事，均链接到线上站点。',
    'exp.ecosystem_sas': 'Singapore American School（新加坡美国学校）',
    'exp.ecosystem_visit': '访问 →',
    'exp.ecosystem_repo': '代码库 →',

    // --- origins ---
    'origins.eyebrow': '图 04 · 离开工作台',
    'origins.title': '本源：一种关于人的潜能的视角',
    'origins.lede':
      '公平：我们在学习中所作的种种假设。我从哪里来，教育本身从哪里开始，以及我们口中所看重的与实际所衡量的之间的落差。',
    'origins.note': '提问，而非答案',
    'origins.description':
      '公平，以及我们在学习中所作的假设——在津巴布韦长大教会我衡量能力而非文凭，而这如何塑造了我今天的技术工作。',
    'origins.open_deck': '打开演示文稿',

    'origins.why_eyebrow': '写这篇的缘由',
    'origins.why_heading': '我带来的视角',
    'origins.why_p1':
      '我在一所国际学校从事技术工作。多数同事认识的我，是那个修东西、铺系统、近来又引入 AI 工具的人。这样描述这份工作并无不妥，但它并未完整描述我看待这份工作的视角。',
    'origins.why_p2_before':
      '我来自津巴布韦——很长一段时间里，我是团队中唯一一位来自非发达国家的公民。上世纪九十年代到本世纪初在那里长大，教会了我一件从未离身的事：',
    'origins.why_p2_em': '真正决定生存与成功的是本事，而不是分数或名校的招牌。',
    'origins.why_p2_after':
      '当基础设施按时失灵，当眼前的问题在任何教科书上都找不到，当创新决定的是活得好还是勉强度日，你对「智力」的实际定义就会变得不一样。',
    'origins.why_p3':
      '所以当学校把公平的视角转向我们对学生所作的假设时，我希望把这个定义带进讨论。不是作为批评，而是作为一个我确实无法独自回答的问题。',

    'origins.argument_eyebrow': '论点',
    'origins.argument_heading': '能力重于文凭',
    'origins.argument_p1':
      '在津巴布韦，你靠的是真正能做成的事——随机应变、协作、解决意料之外的难题——而不是沿着「好成绩、好大学、好工作」那条被照亮的路走下去。能力比文凭更要紧，因为光有文凭并不能让灯继续亮着。',
    'origins.argument_p2':
      '这让我对教育自身的源头产生了好奇。从亚历山大城到文艺复兴时期的学院，那些伟大的学术中心衡量学者的标准，是他能否贡献新知、能否善辩、能否解决真正困难的问题，而不是在人为的时间压力下能记住多少。',
    'origins.argument_pull': '我们是从什么时候起，把培养卓越的心智换成了衡量应试能力？',
    'origins.argument_p3':
      '这正是我在自己工作中反复遇到的张力：我一边在帮助引入能瞬间完成信息检索的技术，一边我们仍常常以学生在时间压力下的记忆能力来评估他们。这两件事同时成立，而我认为我们尚未真正正视它。',

    'origins.journey_eyebrow': '一路走来',
    'origins.journey_heading': '我是怎么走到这里的',
    'origins.journey_lede':
      '从津巴布韦到南非，再到日本、新加坡；从教室到机房，再到策略层面——这也正是为什么我总在提一些夹在三者之间、不太好归类的问题。',

    'origins.now_eyebrow': '当下',
    'origins.now_heading': '我正在做的事',
    'origins.now_lede': '同一个问题的两半——一半在一所学校之内，一半横跨一整片大陆。',
    'origins.now_sas': 'Singapore American School（新加坡美国学校）',
    'origins.now_nyuchi': 'Nyuchi Africa',
    'origins.now_aside':
      'Nyuchi 的工作，是为那些文凭从来不是通行证的地方而建的。我带到学校工作里的，是同一种直觉。',

    'origins.pink_eyebrow': '概念时代',
    'origins.pink_heading': '六种能力',
    'origins.pink_p1_before': 'Daniel Pink 的 ',
    'origins.pink_p1_link': '《全新思维》(A Whole New Mind)',
    'origins.pink_p1_after':
      ' 提出，富足、自动化与亚洲的崛起，已把价值从逻辑的、线性的、表格式的工作，转移到他所说的「高概念」与「高感性」——那些难以外包、也难以自动化的能力。',
    'origins.pink_p2':
      '读到时最触动我的是：这些正是当年在津巴布韦出于必要而决定成败的能力。对我而言，概念时代不是一种预测，而是对我成长之地的描述。',

    'origins.questions_eyebrow': '开放',
    'origins.questions_heading': '真正要紧的问题',
    'origins.questions_lede':
      '我没有答案——只有一些问题，来自一个以不同视角看待这份工作的人。',
    'origins.questions_pull': '会不会有些出色的心智，正因为我们衡量错了东西而被我们错过？',

    'origins.deck_eyebrow': '演示文稿',
    'origins.deck_heading': '完整演示',
    'origins.deck_lede': '当时讲的那份滚动式演示，原样保留。全屏阅读效果最佳。',
    'origins.deck_iframe_title': '本源：一种关于人的潜能的视角 — 演示文稿',
    'origins.deck_fullscreen': '全屏打开',

    'origins.cta_heading': '你注意到了什么？',
    'origins.cta_lede':
      '如果你从事教育、评估，或身处任何能力与文凭之间的落差会显现的地方——我很想听听在你那里，它是什么样子。',
    'origins.cta_book': '预约通话',

    // --- minerals ---
    'minerals.eyebrow': '图 05 · 图例',
    'minerals.title': '矿物色带',
    'minerals.description':
      '来自非洲各地的七种矿物，对应每一页边缘色带上的一段——各自代表什么、产自何处、如何使用。取自 Mzizi 的品牌系统。',
    'minerals.lede':
      '本站每一页的装订边都有七段色带。每一段都是一种产自非洲的矿物，也都承载着界面真正会用到的含义。这里是它的图例。',
    'minerals.note': '读一读边缘',
    'minerals.why_fig': '图 01 — 为什么用矿石',
    'minerals.why_heading': '为什么是矿石，而不是一套色板',
    'minerals.why_p1_before': '一套命名为',
    'minerals.why_p1_primary': '主色',
    'minerals.why_p1_secondary': '辅色',
    'minerals.why_p1_accent': '强调色',
    'minerals.why_p1_sep1': '、',
    'minerals.why_p1_sep2': '与',
    'minerals.why_p1_mid': '的色板，只告诉你一种颜色用在哪里，却说不出它为何存在。',
    'minerals.why_p1_link': 'Mzizi 品牌系统',
    'minerals.why_p1_after':
      '以整片非洲大陆所产的矿物为色彩命名，并保留其来处：这块石头产自哪里、代表什么、在界面中派什么用场。',
    'minerals.why_p2':
      '这份来处正是关键所在。产自加丹加的钴，就在你此刻阅读本文的手机里。以它命名链接的颜色，是一种小小的拒绝——拒绝把材料当作抽象之物。',
    'minerals.why_p3_before': 'Mzizi 是 Bundu 生态中的一个 ',
    'minerals.why_p3_nyuchi': 'nyuchi',
    'minerals.why_p3_mid': ' 项目，建立在赋予这一切形态的乌班图（Ubuntu）原则之上——',
    'minerals.why_p3_ubuntu': '我在，因为我们在',
    'minerals.why_p3_after': '。它的品牌系统、设计令牌与无障碍工具包，都在 ',
    'minerals.why_p3_end': '。',

    'minerals.key_eyebrow': '图 05 · 七种矿物',
    'minerals.key_note': '自上而下',
    'minerals.key_heading': '七种矿物',
    'minerals.key_means': '寓意',
    'minerals.key_mined': '产地',
    'minerals.key_used': '用途',

    'minerals.a11y_fig': '图 02 — 无障碍',
    'minerals.a11y_heading': '七种，逐一实测',
    'minerals.a11y_p1_before': '上表中的比值，是相对本站底色（',
    'minerals.a11y_p1_after':
      '）的 WCAG 2.2 对比度，在构建时由色带所用的同一批设计令牌计算得出。它们不是从色卡上抄来的说法——令牌一旦改变，本页的数字也随之改变。',
    'minerals.a11y_p2_before':
      'Mzizi 把检查内置于系统之中，而非留给每一位使用者：对照其 APCA 与 AAA 下限的对比度检测，以及色觉模拟，都收在 ',
    'minerals.a11y_p2_after':
      ' 的工具包中，并通过其 MCP 服务提供，因此基于该系统构建的智能体可以在交付前先行验证配色。',
    'minerals.a11y_p3_before': '在本站，这些矿物属于',
    'minerals.a11y_p3_nontext': '非文本',
    'minerals.a11y_p3_mid':
      '标识，因此需要跨过的门槛是 WCAG 2.2 SC 1.4.11 的 3:1——七种全部达标。颜色在这里从不是含义的唯一载体：色带带有 ',
    'minerals.a11y_p3_after': '，悬停时每一段都会说出自己的名字，而本页就是它的文字替代。',

    // --- book ---
    'book.eyebrow': '图 06 · 委托',
    'book.title': '预约通话',
    'book.description':
      '与 Bryan Fawcett 预约通话：与 Nyuchi Africa 梳理一项构建，或聊聊教育科技、系统架构，以及为非洲社区而建的产品。',
    'book.lede':
      '把图纸带上，再粗糙也无妨。我们一起弄清它为谁而建、跑在什么上面、会在哪里出问题，再看 Nyuchi 是否是合适的建造团队。',
    'book.note': '把图纸带上',
    'book.topics_eyebrow': '可以聊些什么',
    'book.topics_heading': '值得一谈的话题',
    'book.scheduling_eyebrow': '排期',
    'book.scheduling_heading': '选个时间',
    'book.load': '加载预约日历',
    'book.fallback': '更习惯用邮件？',
    'book.error': '预约日历加载失败，请改发邮件至 bryan@nyuchi.com。',

    // --- adventures ---
    'adv.title': 'Bryan’s Adventures',
    'adv.eyebrow': '图 03 · 野外手记',
    'adv.note': '写于路上',
    'adv.lede': '长途驾驶、不靠谱的地图，以及路的尽头那些地方。多在非洲南部，偶尔更远。',
    'adv.description':
      'Bryan Fawcett 的旅行随笔——长途驾驶、不靠谱的地图，以及路的尽头那些地方，多在非洲南部。',
    'adv.heading': '全部游记',
    'adv.read': '阅读 →',
    'adv.back': '← 返回全部游记',
    'adv.english_only': '仅有英文',
    'adv.english_only_title': '尚未翻译——这篇将以英文打开',
    'adv.empty_title': '还没有写下的游记',
    'adv.empty_body': '第一篇还躺在某个笔记本里。过些日子再来，或者先来聊聊。',
    'adv.unavailable_title': '游记暂时加载不出来',
    'adv.unavailable_body': '文章存放在一个此刻没有响应的内容服务里。它们没有丢失，请过几分钟再试。',
    'adv.missing_title': '没有这篇游记',
    'adv.missing_body': '它可能已经改名，或者你手上的链接过时了。',

    // --- 404 ---
    'nf.title': '找不到这张图纸',
    'nf.description': '该页面在 bryanfawcett.com 上不存在。',
    'nf.eyebrow': '404 · 图纸缺失',
    'nf.heading': '这张图上没有',
    'nf.lede': '链接可能已经过时，或者索引编号略有出入。',
    'nf.note': '查一下图纸目录',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type UiKey = keyof (typeof ui)[typeof defaultLang];

/**
 * The language a URL is asking for.
 *
 * English is unprefixed (`/experience`), Chinese is prefixed (`/zh/experience`),
 * so only the first path segment is ever a locale.
 */
export function getLangFromUrl(url: URL): Lang {
  const [, first] = url.pathname.split('/');
  return first !== undefined && first in languages ? (first as Lang) : defaultLang;
}

/**
 * A `t()` bound to one language.
 *
 * Falls back to English for a key the translation has not caught up with, so a
 * half-finished translation degrades to an English string rather than to
 * `undefined` printed on the page.
 */
export function useTranslations(lang: Lang) {
  return function t(key: UiKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}
