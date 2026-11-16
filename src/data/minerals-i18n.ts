/**
 * Chinese for the mineral legend.
 *
 * Kept here rather than in `src/brand/minerals.ts` on purpose: that file is a
 * mirror of the Mzizi API's `minerals` family, and anything added to it has to
 * be re-added by hand every time it is re-synced. This overlay is keyed by the
 * token name, so a mineral added upstream fails the exhaustiveness check here
 * rather than silently rendering English inside a Chinese page.
 */
import type { MineralName } from '../brand/minerals.js';
import type { ExperimentalName, HeritageName } from '../brand/palette.js';

export interface MineralGloss {
  /** The stone's Chinese name; the token name is shown alongside it. */
  readonly label: string;
  readonly origin: string;
  readonly symbolism: string;
  readonly usage: string;
}

export const MINERALS_ZH: Record<MineralName, MineralGloss> = {
  cobalt: {
    label: '钴',
    origin: '刚果（金）加丹加与赞比亚铜带省',
    symbolism: '数字化的未来、信任、知识',
    usage: '链接、聚焦框、信息类状态',
  },
  tanzanite: {
    label: '坦桑石',
    origin: '坦桑尼亚 梅雷拉尼山',
    symbolism: '珍贵、创造力、联结',
    usage: '品牌主强调色',
  },
  malachite: {
    label: '孔雀石',
    origin: '刚果铜带',
    symbolism: '生长、自然、成功',
    usage: '成功状态、正向操作',
  },
  gold: {
    label: '黄金',
    origin: '加纳、南非、马里',
    symbolism: '蜂蜜、回报、温暖',
    usage: '成就与亮点',
  },
  terracotta: {
    label: '陶土',
    origin: '泛非萨赫勒地带',
    symbolism: '土地、社区、扎根',
    usage: '社区类界面、温度感',
  },
  sodalite: {
    label: '方钠石',
    origin: '纳米比亚与南非的库内内河一带',
    symbolism: '智慧、深度、推理',
    usage: 'AI 界面、深度推理状态',
  },
  copper: {
    label: '铜',
    origin: '中部非洲铜带，赞比亚与刚果（金）',
    symbolism: '联结、根基、守护',
    usage: '生态身份、公共共享',
  },
};

/**
 * The heritage seven. Same arrangement as the minerals: keyed by token name, so a
 * tone added upstream fails the exhaustiveness check here instead of rendering
 * English inside a Chinese page.
 */
export const HERITAGE_ZH: Record<HeritageName, MineralGloss> = {
  indigo: {
    label: '靛蓝',
    origin: '靛蓝属植物，西非的纺织传统',
    symbolism: '黄昏、深邃、染匠的手艺',
    usage: '暮色表面、深邃氛围、小应用的情绪色',
  },
  savanna: {
    label: '稀树草原',
    origin: '撒哈拉以南的草原',
    symbolism: '晒干的草、开阔的土地、旱季',
    usage: '温暖的草原表面、日光氛围',
  },
  baobab: {
    label: '猴面包树',
    origin: '猴面包树属，遍布整个非洲大陆',
    symbolism: '生命之树、岁月、庇护',
    usage: '质朴的表面、踏实的氛围、树皮色调',
  },
  sunset: {
    label: '日落',
    origin: '黄昏时的非洲地平线',
    symbolism: '一日将尽、温暖、聚首的时刻',
    usage: '温暖的强调表面、黄金时刻的氛围',
  },
  river: {
    label: '河流',
    origin: '非洲的大河——赞比西河、尼罗河、刚果河',
    symbolism: '流动、生命、旅程',
    usage: '清冷的表面、流动的氛围、水的色调',
  },
  hematite: {
    label: '赤铁矿',
    origin: '南非 西申与塔巴津比',
    symbolism: '根基、耐久、底层',
    usage: '中性锚点、小应用表面、氛围',
  },
  kalahari: {
    label: '卡拉哈里',
    origin: '南部非洲 卡拉哈里与纳米布沙漠',
    symbolism: '开阔、空间、明亮的一端',
    usage: '浅色锚点、温暖的背景、小应用表面',
  },
};

/** The experimental seven carry a colour and nothing else, so only a name. */
export const EXPERIMENTAL_ZH: Record<ExperimentalName, string> = {
  ember: '余烬',
  acacia: '金合欢',
  fern: '蕨',
  lagoon: '泻湖',
  storm: '风暴',
  dusk: '暮色',
  protea: '帝王花',
};
