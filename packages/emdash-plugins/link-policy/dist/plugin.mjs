// packages/emdash-plugins/core/src/link.ts
var FORBIDDEN = /[\\\x00-\x20\x7f-\x9f\s\u200b-\u200f\u2028\u2029\u2060\ufeff]/;
function linkProblem(href) {
  if (!href) return "empty";
  if (FORBIDDEN.test(href)) return "whitespace";
  if (href.startsWith("//")) return "protocol-relative";
  if (/^(\/|#|\?)/.test(href)) return null;
  let url;
  try {
    url = new URL(href);
  } catch {
    return "malformed";
  }
  if (url.protocol === "mailto:" || url.protocol === "tel:") return null;
  if (url.protocol !== "https:" && url.protocol !== "http:") return "scheme";
  return null;
}
function show(href) {
  const printable = href.replace(/[\u0000-\u001f\u007f-\u009f]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);
  return printable.length > 80 ? `${printable.slice(0, 77)}...` : printable;
}
function linkFinding(href, path, where) {
  const problem = linkProblem(href);
  if (!problem) return null;
  const fix = 'Use an https:// or http:// address, mailto: or tel:, a path starting with a single "/", or a "#section" anchor.';
  const message = {
    empty: `${where}: a link has no address. Add the address or remove the link.`,
    whitespace: `${where}: the link address "${show(href)}" contains a space, backslash or hidden character. Remove it and paste the address again.`,
    "protocol-relative": `${where}: the link address "${show(href)}" starts with "//", which can point to another site. Write the full https:// address instead.`,
    scheme: `${where}: the link address "${show(href)}" is not allowed (only web, mail and phone links are). ${fix}`,
    malformed: `${where}: the link address "${show(href)}" is not a valid address. ${fix}`
  };
  return { rule: `link.${problem}`, severity: "error", path, message: message[problem] };
}

// packages/emdash-plugins/core/src/pt.ts
function blocks(body) {
  return Array.isArray(body) ? body.filter((b) => b && typeof b === "object") : [];
}

// packages/emdash-plugins/core/src/body-links.ts
function checkLinks(body) {
  const out = [];
  blocks(body).forEach((block, i) => {
    (block.markDefs ?? []).forEach((def, j) => {
      if (def._type !== "link") return;
      const href = typeof def.href === "string" ? def.href : "";
      const f = linkFinding(href, `body[${i}].markDefs[${j}]`, `Block ${i + 1}`);
      if (f) out.push(f);
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

// packages/emdash-plugins/link-policy/src/plugin.ts
function decide(content) {
  const data = content["data"] && typeof content["data"] === "object" ? content["data"] : {};
  const reason = formatReason(checkLinks(data["body"]));
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
