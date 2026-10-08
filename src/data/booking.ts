/**
 * What a call is likely to be about.
 *
 * Lifted out of `book.astro` when the page became two pages: content in
 * `src/data/` so a copy edit never means touching a layout, and so the Chinese
 * sits beside the English rather than in a second template.
 */
import type { MineralName } from '../brand/minerals.js';
import type { Bilingual } from '../i18n/localize.js';
import { listInLang } from '../i18n/localize.js';
import type { Lang } from '../i18n/ui.js';

/**
 * The 30-minute "Book a call" event on Cal.com.
 *
 * One constant, because two things point at it: the embed on /book and the QR
 * on the contact card. A renamed event that one of them missed would send a
 * reader to a Cal.com 404 from a printed card nobody can update.
 */
export const CAL_LINK = 'bryanfawcett/book-a-call';
export const BOOKING_URL = `https://cal.com/${CAL_LINK}`;

export interface BookingTopic {
  readonly title: string;
  readonly detail: string;
  readonly mineral: MineralName;
}

const TOPICS: readonly Bilingual<BookingTopic, 'title' | 'detail'>[] = [
  {
    title: 'Scoping a build with Nyuchi',
    detail:
      'Who will use it, what it runs on, where the data goes, and what breaks when the signal drops. You leave with a clearer picture of the system, whether or not you hire us.',
    mineral: 'gold',
    zh: {
      title: '与 Nyuchi 梳理一项构建',
      detail:
        '谁会用它、它跑在什么上面、数据流向哪里、信号一断会坏掉什么。无论最后是否委托我们，你都会对整个系统看得更清楚。',
    },
  },
  {
    title: 'EdTech & digital transformation',
    detail:
      'Platform selection, rollout, governance, and the change management that decides whether any of it sticks.',
    mineral: 'cobalt',
    zh: {
      title: '教育科技与数字化转型',
      detail: '平台选型、落地推行、治理，以及真正决定成败的变革管理。',
    },
  },
  {
    title: 'Systems & architecture',
    detail:
      'Infrastructure, identity, device management, and building systems that stay up when you are asleep.',
    mineral: 'sodalite',
    zh: {
      title: '系统与架构',
      detail: '基础设施、身份认证、设备管理，以及在你睡着时依然稳稳运行的系统。',
    },
  },
  {
    title: 'Building for African communities',
    detail:
      'What the Nyuchi ecosystem has taught me about designing for constrained connectivity and real budgets.',
    mineral: 'terracotta',
    zh: {
      title: '为非洲社区而建',
      detail: 'Nyuchi 生态教会我的事：如何为受限的网络条件和真实的预算做设计。',
    },
  },
];

export function bookingTopics(lang: Lang): BookingTopic[] {
  return listInLang(TOPICS, lang);
}
