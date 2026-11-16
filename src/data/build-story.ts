/**
 * How this site was built — the content of /how-this-was-built.
 *
 * Prose lives here, English with its Chinese beside it, so a copy edit never
 * touches layout. `docs/how-we-built-this.md` is the longer repo-side version.
 */
import type { MineralName } from '../brand/minerals.js';
import type { Bilingual } from '../i18n/localize.js';
import { inLang, listInLang } from '../i18n/localize.js';
import type { Lang } from '../i18n/ui.js';

export interface StoryItem {
  readonly title: string;
  readonly detail: string;
  readonly mineral: MineralName;
}

export interface StorySection {
  readonly id: string;
  readonly eyebrow: string;
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly items: readonly StoryItem[];
}

type Item = Bilingual<StoryItem, 'title' | 'detail'>;
type Section = Omit<StorySection, 'items'> & { readonly items: readonly Item[] };

const SECTIONS: readonly Bilingual<Section, 'eyebrow' | 'heading' | 'paragraphs'>[] = [
  {
    id: 'shape',
    eyebrow: 'The shape of it',
    heading: 'One visitor, one action',
    paragraphs: [
      'A content site with one owner and one job: an organisation decides whether to hire Nyuchi, and books a call. Everything else is in service of that, and of showing the Mzizi standard working in public.',
      'It is Astro with no client framework. Almost every route is prerendered and served as static files from Cloudflare. The blog is the exception: it reads Sanity per request, so publishing a post is live without a rebuild. There are two languages, English at the root and Chinese under /zh, and each page is written once and wrapped twice.',
    ],
    items: [],
    zh: {
      eyebrow: '整体结构',
      heading: '一位访客，一个行动',
      paragraphs: [
        '这是一个只有一位作者、只有一项任务的内容网站：让一个机构判断是否聘用 Nyuchi，并预约一次通话。其余一切都服务于此，也服务于把 Mzizi 标准公开地用起来。',
        '它是不带客户端框架的 Astro。几乎所有页面都在构建时预渲染，并由 Cloudflare 作为静态文件提供。博客是例外：它在每次请求时读取 Sanity，所以发布文章无需重新构建即可上线。网站有两种语言，英文在根路径，中文在 /zh 下，每个页面只写一次、套用两次。',
      ],
    },
  },
  {
    id: 'design',
    eyebrow: 'The design system',
    heading: 'Rules that came from getting it wrong',
    paragraphs: [
      'The look is the Mzizi standard: 21 colour families keyed with a data-mineral attribute, Noto Serif, Noto Sans and JetBrains Mono, pill buttons, hairline cards, no shadows, light and dark following the device. All of it comes from one tokens file, and every rule lives in one stylesheet.',
    ],
    items: [
      {
        title: 'A mineral is never the colour of text',
        detail:
          'On a near-black ground the raw minerals fail APCA outright. The mineral goes under the word or beside it; the word is ink.',
        mineral: 'cobalt',
        zh: {
          title: '矿物色从不用作文字颜色',
          detail:
            '在近黑底色上，原始矿物色根本通不过 APCA。矿物色放在文字下方或旁边，文字本身用墨色。',
        },
      },
      {
        title: 'Markup names things, the stylesheet colours them',
        detail:
          'No inline style for colour, so the page keeps a strict content security policy.',
        mineral: 'gold',
        zh: {
          title: '标记负责命名，样式表负责上色',
          detail: '颜色不使用内联样式，因此页面可以保持严格的内容安全策略。',
        },
      },
      {
        title: 'Every text block is measured',
        detail:
          'A contrast gate renders each route at desktop and phone width, in both themes, and scores the pixels actually under each glyph against the minimum size APCA allows.',
        mineral: 'malachite',
        zh: {
          title: '每一块文字都经过测量',
          detail:
            '对比度检查会在桌面和手机宽度、明暗两种主题下渲染每个页面，并按 APCA 允许的最小字号，对每个字形下方的实际像素打分。',
        },
      },
      {
        title: 'The system documents itself',
        detail:
          'An installable design-system skill and a Claude artifact are generated from the built pages, and CI fails if they drift.',
        mineral: 'tanzanite',
        zh: {
          title: '设计系统自我记录',
          detail: '可安装的设计系统技能与 Claude 工件由构建出的页面生成，若出现偏差，CI 会失败。',
        },
      },
    ],
    zh: {
      eyebrow: '设计系统',
      heading: '这些规则来自犯过的错',
      paragraphs: [
        '外观遵循 Mzizi 标准：21 个色系通过 data-mineral 属性标注，字体为 Noto Serif、Noto Sans 与 JetBrains Mono，按钮为胶囊形，卡片只有细线，没有阴影，明暗主题跟随设备。这一切来自同一个令牌文件，所有样式规则都在同一个样式表中。',
      ],
    },
  },
  {
    id: 'blog',
    eyebrow: 'The blog',
    heading: 'Why Sanity stays Sanity',
    paragraphs: [
      'Bryan’s Adventures is written in Sanity and rendered on demand. A missing post is a real 404. An unreachable Sanity is a 503 with a retry hint. An empty blog says so. Collapsing those three would tell a reader the writing is gone when the service is merely down.',
      'This is the one part that keeps its JavaScript: the Sanity client, the Studio and the portable-text pipeline belong to Sanity’s own ecosystem, and porting them gains nothing. Everything else is moving to Rust.',
    ],
    items: [],
    zh: {
      eyebrow: '博客',
      heading: '为什么 Sanity 仍然是 Sanity',
      paragraphs: [
        '「Bryan 的冒险」用 Sanity 撰写，并按需渲染。文章不存在是真正的 404；Sanity 无法访问则是带重试提示的 503；博客为空就如实说明。把这三种情况混为一谈，会让读者以为文章消失了，而实际上只是服务暂时不可用。',
        '这是唯一保留 JavaScript 的部分：Sanity 客户端、Studio 与富文本管线属于 Sanity 自己的生态，移植它们没有收益。其余一切正在迁往 Rust。',
      ],
    },
  },
  {
    id: 'rust',
    eyebrow: 'The Rust move',
    heading: 'Rust renders, Astro routes',
    paragraphs: [
      'The aim is that Rust renders and runs, and Astro is only the router, the static prerenderer and the image pipeline. This is in progress, not finished, and the page says so.',
      'A port is not done until it is proven. A parity check finds each component as Astro shipped it, reads its inputs back out of the markup, renders the Rust version, and compares the two as canonical HTML. Cloudflare’s build image has no Rust toolchain, so the rendered output is committed and CI fails if it goes stale.',
    ],
    items: [
      {
        title: 'Done',
        detail:
          'All ten components are ported to Rust and match Astro’s output. The header, footer and decorative layers are rendered by Rust and inserted by Astro. The deck’s Worker is a Rust Worker, and the stylesheet and image-URL verifiers have Rust versions.',
        mineral: 'malachite',
        zh: {
          title: '已完成',
          detail:
            '十个组件全部移植到 Rust，并与 Astro 的输出一致。页眉、页脚和装饰层由 Rust 渲染、由 Astro 插入。演示文稿的 Worker 是 Rust Worker，样式表与图片地址验证器也有 Rust 版本。',
        },
      },
      {
        title: 'Next',
        detail:
          'The remaining five components, the theme toggle as WebAssembly, the portrait and social-card renderers, and the site’s own Worker.',
        mineral: 'gold',
        zh: {
          title: '接下来',
          detail: '其余五个组件、以 WebAssembly 实现的主题切换、头像与社交卡片渲染器，以及网站自己的 Worker。',
        },
      },
    ],
    zh: {
      eyebrow: '迁往 Rust',
      heading: 'Rust 负责渲染，Astro 负责路由',
      paragraphs: [
        '目标是由 Rust 负责渲染与运行，而 Astro 只做路由、静态预渲染和图片处理。这项工作仍在进行，尚未完成，本页如实说明。',
        '移植只有在得到证明后才算完成。一致性检查会找到 Astro 输出的每个组件，从标记中读回其输入，渲染 Rust 版本，并将两者作为规范化 HTML 比较。Cloudflare 的构建镜像没有 Rust 工具链，所以渲染结果会被提交到仓库，一旦过期，CI 就会失败。',
      ],
    },
  },
  {
    id: 'broke',
    eyebrow: 'What broke',
    heading: 'The bugs that cost real time',
    paragraphs: [],
    items: [
      {
        title: 'A blog that 404ed for every browser',
        detail:
          'The blog returned 200 to curl and 404 to every real visitor, because static assets are matched before the Worker on a browser navigation. The fix is a run-worker-first list, and the lesson is to test with the navigate header set.',
        mineral: 'terracotta',
        zh: {
          title: '对所有浏览器都返回 404 的博客',
          detail:
            '博客对 curl 返回 200，对所有真实访客却返回 404，因为浏览器导航时静态资源会先于 Worker 匹配。解决办法是 run-worker-first 列表，教训是测试时要带上 navigate 请求头。',
        },
      },
      {
        title: 'A header that collided with its own links',
        detail:
          'At mid widths the navigation ran into the brand. Below 68rem the links now drop to a second row that scrolls sideways. There is never a hamburger.',
        mineral: 'copper',
        zh: {
          title: '与自身链接相撞的页眉',
          detail:
            '在中等宽度下，导航会撞上品牌标识。现在低于 68rem 时，链接会下移到可横向滚动的第二行，从不使用汉堡菜单。',
        },
      },
      {
        title: 'Headers that could not be changed',
        detail:
          'The deck’s Rust Worker failed with a modify-immutable-headers error: a response from the assets binding has to be copied before its headers are set.',
        mineral: 'cobalt',
        zh: {
          title: '无法修改的响应头',
          detail:
            '演示文稿的 Rust Worker 曾因“无法修改不可变响应头”而失败：来自资源绑定的响应必须先复制，才能设置其响应头。',
        },
      },
    ],
    zh: {
      eyebrow: '出过的问题',
      heading: '真正花了时间的 bug',
      paragraphs: [],
    },
  },
];

export function storySections(lang: Lang): StorySection[] {
  return SECTIONS.map((section) => {
    const resolved = inLang(section, lang);
    return {
      ...resolved,
      items: listInLang(section.items, lang),
    };
  });
}
