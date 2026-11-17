/**
 * Text that sits on top of other text, on phones and tablets in both orientations.
 *
 * The contrast gate measures pixels and the stylesheet gate measures rules; neither notices a
 * figure tag wrapping onto the heading below it. This renders each route at five device sizes,
 * takes every visible text-bearing element's per-line boxes (so a phrase that wraps is not one
 * big box) and fails on any two unrelated ones that overlap by more than a sliver. Tight display
 * leading (a few pixels) is by design and ignored. Run against `astro dev` like the contrast gate.
 */
import { chromium } from 'playwright';
const SIZES = [[360,740],[390,844],[430,932],[667,375],[820,1180]];
const ROUTES = ['/','/experience','/adventures','/origins-with-perspective','/minerals','/how-this-was-built','/book','/zh','/zh/minerals','/zh/experience'];
const b = await chromium.launch();
let total = 0;
for (const [w,h] of SIZES) {
  const ctx = await b.newContext({ viewport:{width:w,height:h}, hasTouch:true, isMobile:true });
  const p = await ctx.newPage();
  for (const r of ROUTES) {
    await p.goto(`http://${process.env.CONTRAST_HOST||'127.0.0.1'}:${process.env.CONTRAST_PORT||process.argv[2]||'4321'}`+r,{waitUntil:'networkidle'});
    await p.addStyleTag({content:'*{transition:none!important;animation:none!important}.reveal{opacity:1!important;transform:none!important}.mzizi-header{position:static!important}'});
    const hits = await p.evaluate(() => {
      const els = [...document.querySelectorAll('body *')].filter(el => {
        if (el.closest('[aria-hidden="true"], svg, astro-dev-toolbar, script, style')) return false;
        const cs = getComputedStyle(el); if (cs.visibility==='hidden'||cs.display==='none'||cs.position==='fixed') return false;
        const own = [...el.childNodes].some(n => n.nodeType===3 && n.textContent.trim());
        return own || el.matches('img, button, a.btn, input');
      });
      const rects = els.flatMap(el => [...el.getClientRects()].map(r => ({ el, r }))).filter(x => x.r.width>2 && x.r.height>2);
      const out = [];
      for (let i=0;i<rects.length;i++) for (let j=i+1;j<rects.length;j++) {
        const a=rects[i], c=rects[j];
        if (a.el.contains(c.el) || c.el.contains(a.el)) continue;
        const ix = Math.min(a.r.right,c.r.right)-Math.max(a.r.left,c.r.left);
        const iy = Math.min(a.r.bottom,c.r.bottom)-Math.max(a.r.top,c.r.top);
        if (ix>3 && iy>6) {
          const n = e => e.tagName.toLowerCase()+'.'+(e.className||'').toString().split(' ')[0]+'"'+(e.textContent||'').trim().slice(0,18)+'"';
          out.push(`${n(a.el)} x ${n(c.el)} (${Math.round(ix)}x${Math.round(iy)})`);
        }
      }
      return out.slice(0,6);
    });
    if (hits.length) { total += hits.length; console.log(`${w}x${h} ${r}\n   ${hits.join('\n   ')}`); }
  }
  await ctx.close();
}
console.log('overlaps:', total);
await b.close();
if (total) process.exit(1);
