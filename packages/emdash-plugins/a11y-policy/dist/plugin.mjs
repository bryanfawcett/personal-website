// packages/emdash-plugins/core/src/pt.ts
function blocks(body) {
  return Array.isArray(body) ? body.filter((b) => b && typeof b === "object") : [];
}

// packages/emdash-plugins/core/src/a11y.ts
var VAGUE_LINK_TEXT = [
  // English
  "click here",
  "click",
  "here",
  "this link",
  "link",
  "this",
  "read more",
  "more",
  "learn more",
  "see more",
  "more info",
  "tap here",
  "find out more",
  // Chinese (Simplified)
  "\u70B9\u51FB\u8FD9\u91CC",
  "\u70B9\u51FB\u6B64\u5904",
  "\u70B9\u8FD9\u91CC",
  "\u8FD9\u91CC",
  "\u6B64\u5904",
  "\u9605\u8BFB\u66F4\u591A",
  "\u4E86\u89E3\u66F4\u591A",
  "\u66F4\u591A",
  "\u67E5\u770B\u66F4\u591A",
  "\u8BE6\u60C5",
  "\u94FE\u63A5",
  "\u70B9\u51FB\u67E5\u770B"
];
var BARE_URL = /^(https?:\/\/|www\.)\S+$/i;
function plain(block) {
  return (block.children ?? []).map((c) => typeof c.text === "string" ? c.text : "").join("");
}
function snippet(text) {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > 40 ? `${t.slice(0, 37)}...` : t;
}
function normaliseLinkText(text) {
  return text.replace(/\s+/g, " ").trim().replace(/[\s.,;:!?…。，；：！？、›»>→\-]+$/u, "").toLowerCase();
}
function linkText(block, key) {
  if (!key) return "";
  return (block.children ?? []).filter((c) => Array.isArray(c.marks) && c.marks.includes(key)).map((c) => typeof c.text === "string" ? c.text : "").join("");
}
function hasImage(value) {
  if (!value || typeof value !== "object") return false;
  const v = value;
  return Boolean(v["id"] ?? v["src"] ?? v["asset"]);
}
function checkAccessibility(input) {
  const out = [];
  if (hasImage(input.cover)) {
    const alt = input.cover["alt"];
    if (typeof alt !== "string" || alt.trim() === "") {
      out.push({
        rule: "a11y.cover-alt",
        severity: "error",
        path: "cover",
        message: "The cover image has no alt text. Open the cover image and describe what it shows in a short sentence, for people who cannot see it."
      });
    }
  }
  let previous = 0;
  blocks(input.body).forEach((block, i) => {
    const where = `Block ${i + 1}`;
    const path = `body[${i}]`;
    if (block._type === "image") {
      if (typeof block.alt !== "string" || block.alt.trim() === "") {
        out.push({
          rule: "a11y.image-alt",
          severity: "error",
          path,
          message: `${where}: this image has no alt text. Select the image and describe what it shows in a short sentence.`
        });
      }
      return;
    }
    const heading = /^h([1-6])$/.exec(block.style ?? "");
    if (heading) {
      const level = Number(heading[1]);
      const label = `${where} (heading "${snippet(plain(block))}")`;
      if (level === 1) {
        out.push({
          rule: "a11y.heading-h1",
          severity: "error",
          path,
          message: `${label}: the page title is already the only top-level heading. Change this to Heading (h2).`
        });
      } else if (level >= 4) {
        out.push({
          rule: "a11y.heading-deep",
          severity: "error",
          path,
          message: `${label}: this site uses only Heading (h2) and Subheading (h3) inside a post. Change it to one of those.`
        });
      } else if (previous === 0 && level !== 2) {
        out.push({
          rule: "a11y.heading-start",
          severity: "error",
          path,
          message: `${label}: the first heading in a post must be Heading (h2), not h${level}. Change it to h2.`
        });
      }
      if (level === 2 || level === 3) previous = level;
    }
    (block.markDefs ?? []).forEach((def, j) => {
      if (def._type !== "link") return;
      const href = typeof def.href === "string" ? def.href : "";
      const text = linkText(block, def._key);
      const label = `${where}, link "${snippet(text || href)}"`;
      const defPath = `${path}.markDefs[${j}]`;
      const trimmed = text.trim();
      if (trimmed === "") {
        out.push({
          rule: "a11y.link-text-empty",
          severity: "error",
          path: defPath,
          message: `${where}: a link has no visible words. Select the words that describe where it goes and link those.`
        });
      } else if (BARE_URL.test(trimmed)) {
        out.push({
          rule: "a11y.link-text-url",
          severity: "error",
          path: defPath,
          message: `${label}: a web address is read out letter by letter by screen readers. Replace the link text with words that say where it goes.`
        });
      } else if (VAGUE_LINK_TEXT.includes(normaliseLinkText(text))) {
        out.push({
          rule: "a11y.link-text-vague",
          severity: "error",
          path: defPath,
          message: `${label}: "${snippet(trimmed)}" does not say where the link goes. Rewrite the link text to name its destination.`
        });
      }
    });
  });
  return out;
}

// packages/emdash-plugins/core/src/reason.ts
var MAX_REASON_LENGTH = 500;
function formatReason(findings) {
  const errors = findings.filter((f) => f.severity === "error");
  if (errors.length === 0) return "";
  const head = `Not published: ${errors.length} ${errors.length === 1 ? "problem needs" : "problems need"} fixing.`;
  const lines = [];
  let used = [...head].length;
  for (let i = 0; i < errors.length; i++) {
    const rest = errors.length - i;
    const line = `${i + 1}. ${errors[i].message}`;
    const cost = 1 + [...line].length;
    const reserve = rest > 1 ? 1 + [...`...and ${rest - 1} more.`].length : 0;
    if (used + cost + reserve > MAX_REASON_LENGTH) {
      if (lines.length === 0) {
        const room = MAX_REASON_LENGTH - used - 2 - (rest > 1 ? 1 + [...`...and ${rest - 1} more.`].length : 0);
        lines.push(`${[...line].slice(0, Math.max(room, 0)).join("").trimEnd()}\u2026`);
        if (rest > 1) lines.push(`...and ${rest - 1} more.`);
      } else {
        lines.push(`...and ${rest} more.`);
      }
      return [head, ...lines].join("\n");
    }
    lines.push(line);
    used += cost;
  }
  return [head, ...lines].join("\n");
}

// packages/emdash-plugins/a11y-policy/src/plugin.ts
function decide(content) {
  const data = content["data"] && typeof content["data"] === "object" ? content["data"] : {};
  const findings = checkAccessibility({ body: data["body"], cover: data["cover"] });
  const reason = formatReason(findings);
  return reason ? { cancel: true, reason } : void 0;
}
var plugin = {
  hooks: {
    "content:beforePublish": async (event) => decide(event.content),
    "content:beforeSchedule": async (event) => decide(event.content)
  }
};
var plugin_default = plugin;
export {
  plugin_default as default
};
