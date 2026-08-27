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
