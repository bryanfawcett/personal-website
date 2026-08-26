/**
 * Page transitions: a drawing being unrolled.
 *
 * The sheet metaphor only holds if moving between pages feels like unwinding
 * one roll and winding on another — the outgoing sheet rolls away, the
 * incoming one unrolls into place. The keyframes themselves live in
 * global.css, because `TransitionAnimation.name` is a CSS animation name and
 * Astro emits it into a `::view-transition-*` rule it writes itself.
 *
 * `prefers-reduced-motion` is handled in global.css too: the blanket
 * `transition-duration` override in that file matches `*` and its two
 * pseudo-elements, which does not reach `::view-transition-old(root)`.
 */
import type { TransitionDirectionalAnimations } from 'astro';

/** Paper has some spring in it; the curve is eased out, not linear. */
const SHEET = {
  duration: '0.44s',
  easing: 'cubic-bezier(0.32, 0.08, 0.24, 1)',
  fillMode: 'both',
} as const;

export const unroll: TransitionDirectionalAnimations = {
  /** Going deeper: the old sheet rolls up, the new one unrolls downward. */
  forwards: {
    old: { name: 'sheet-roll-up', ...SHEET },
    new: { name: 'sheet-unroll-down', ...SHEET },
  },
  /** Going back: the same motion, wound the other way. */
  backwards: {
    old: { name: 'sheet-roll-down', ...SHEET },
    new: { name: 'sheet-unroll-up', ...SHEET },
  },
};
