// Rendering helpers shared by the Astro components and the page generator.
import { slug } from "github-slugger";
import { localizeHref, tr } from "./i18n.mjs";

export const ORIGIN = "https://haneoka.org";

/** Anchor of an endpoint heading on its page for a locale (matches Astro's heading ids). */
export const endpointAnchor = (endpoint, locale) => slug(tr(endpoint.title, locale));

/** Resolve `ep:<id>` and root-relative links for the given locale. */
export function resolveHref(href, locale, registry) {
  if (href.startsWith("ep:")) {
    const entry = registry.get(href.slice(3));
    if (!entry) {
      const legacy = { releases: "servers/releases", catalog: "servers/catalog", media: "servers/media", announcements: "servers/announcements", "team-builder": "servers/client" }[href.slice(3).split(".")[0]];
      if (legacy) return localizeHref(`/${legacy}/`, locale);
      throw new Error(`Unknown endpoint link ${href}`);
    }
    return `${localizeHref(`/${entry.page.slug}/`, locale)}#${endpointAnchor(entry.endpoint, locale)}`;
  }
  return localizeHref(href, locale);
}

const escapeHtml = (value) =>
  value.replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;").replace(/"/gu, "&quot;");

/** Tiny inline Markdown → HTML: `code`, **bold**, [text](href). */
export function inlineHtml(text, locale, registry) {
  const parts = text.split(/(`[^`]+`)/u);
  return parts
    .map((part) => {
      if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
        return `<code>${escapeHtml(part.slice(1, -1))}</code>`;
      }
      let html = escapeHtml(part);
      html = html.replace(/\*\*([^*]+)\*\*/gu, "<strong>$1</strong>");
      html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/gu, (_, label, href) => {
        const target = resolveHref(href.replace(/&amp;/gu, "&"), locale, registry);
        const external = /^https?:/u.test(target);
        return `<a href="${escapeHtml(target)}"${external ? ' rel="noopener"' : ""}>${label}</a>`;
      });
      return html;
    })
    .join("");
}

/** Inline Markdown that may contain inline code with `[...](...)` link syntax. */
export function inlineHtmlWithCodeLinks(text, locale, registry) {
  // Allow [`code`](href) by rendering link labels that are pure code spans.
  return inlineHtml(
    text.replace(/\[`([^`]+)`\]\(([^)\s]+)\)/gu, (_, code, href) => `[\u0000${code}\u0000](${href})`),
    locale,
    registry,
  ).replace(/\u0000([^\u0000]+)\u0000/gu, (_, code) => `<code>${escapeHtml(code)}</code>`);
}

/** Markdown for MDX output: resolve links and escape MDX-significant characters outside code spans. */
export function mdxText(text, locale, registry) {
  return text
    .split(/(`[^`]+`)/u)
    .map((part) => {
      if (part.startsWith("`") && part.endsWith("`") && part.length > 1) return part;
      return part
        .replace(/[{}<>]/gu, (c) => ({ "{": "&#123;", "}": "&#125;", "<": "&lt;", ">": "&gt;" })[c])
        .replace(/\]\(([^)\s]+)\)/gu, (_, href) => `](${resolveHref(href, locale, registry)})`);
    })
    .join("");
}

const STATUS_TEXT = {
  200: "OK", 201: "Created", 202: "Accepted", 204: "No Content", 206: "Partial Content",
  302: "Found", 304: "Not Modified", 308: "Permanent Redirect",
};
export const statusLine = (status) => `${status} ${STATUS_TEXT[status] ?? ""}`.trim();

/** Fill `{name}` placeholders for display; used for path examples. */
export const displayPath = (path) => path;

const shellQuote = (value) => `'${String(value).replace(/'/gu, `'\\''`)}'`;

const SESSION_AUTH = new Set(["session", "sessionWrite", "sync"]);

/** Build a cURL command for an endpoint example. */
export function curlExample(endpoint) {
  const request = endpoint.example?.request ?? {};
  const method = request.method ?? endpoint.method;
  const url = `${endpoint.server || ORIGIN}${request.path}`;
  const lines = [];
  const flags = method === "HEAD" ? "-sSI" : request.binary ? "-sS -o output.bin" : "-sS";
  lines.push(`curl ${flags}${method !== "GET" && method !== "HEAD" ? ` -X ${method}` : ""} "${url}"`);
  if (SESSION_AUTH.has(endpoint.auth) || request.cookie) lines.push(`-H "Cookie: __Secure-haneoka.session_token=$HANEOKA_SESSION"`);
  if (endpoint.auth === "sync") lines.push(`-H "X-Haneoka-Expected-User: $HANEOKA_USER_ID"`);
  for (const [name, value] of Object.entries(request.headers ?? {})) lines.push(`-H "${name}: ${value}"`);
  if (request.body !== undefined) {
    if (request.bodyFile) {
      lines.push(`-H "Content-Type: ${request.contentType ?? "application/octet-stream"}"`);
      lines.push(`--data-binary @${request.bodyFile}`);
    } else {
      lines.push(`-H "Content-Type: application/json"`);
      lines.push(`--data ${shellQuote(JSON.stringify(request.body))}`);
    }
  }
  return lines.join(" \\\n  ");
}

/** Build a JavaScript fetch example. */
export function fetchExample(endpoint) {
  const request = endpoint.example?.request ?? {};
  const method = request.method ?? endpoint.method;
  const sameOrigin = SESSION_AUTH.has(endpoint.auth) || endpoint.auth === "sameOriginRead" || endpoint.auth === "betterAuth";
  const url = sameOrigin ? request.path : `${endpoint.server || ORIGIN}${request.path}`;
  const options = [];
  if (method !== "GET") options.push(`method: "${method}"`);
  if (sameOrigin) options.push(`credentials: "include"`);
  const headers = { ...(request.headers ?? {}) };
  if (endpoint.auth === "sync") headers["X-Haneoka-Expected-User"] = "${userId}";
  if (request.body !== undefined) headers["Content-Type"] = request.bodyFile ? request.contentType ?? "application/octet-stream" : "application/json";
  const headerEntries = Object.entries(headers);
  if (headerEntries.length) {
    const rendered = headerEntries
      .map(([name, value]) => `    ${/^[A-Za-z_$][\w$]*$/u.test(name) ? name : JSON.stringify(name)}: ${value.includes("${") ? `\`${value}\`` : JSON.stringify(value)}`)
      .join(",\n");
    options.push(`headers: {\n${rendered},\n  }`);
  }
  if (request.body !== undefined) {
    options.push(request.bodyFile ? "body: file" : `body: JSON.stringify(${JSON.stringify(request.body, null, 2).replace(/\n/gu, "\n  ")})`);
  }
  const call = options.length ? `fetch(${JSON.stringify(url)}, {\n  ${options.join(",\n  ")},\n})` : `fetch(${JSON.stringify(url)})`;
  const status = endpoint.example?.response?.status;
  const lines = [`const response = await ${call};`];
  lines.push("if (!response.ok) throw new Error(`HTTP ${response.status}`);");
  if (method === "HEAD") {
    lines.push(`console.log(response.headers.get("X-Haneoka-Release-Id"));`);
  } else if (status === 204 || endpoint.example?.response?.empty) {
    // nothing to parse
  } else if (request.binary || endpoint.example?.response?.binary) {
    lines.push("const blob = await response.blob();");
  } else if (endpoint.example?.response?.text !== undefined) {
    lines.push("const text = await response.text();");
  } else {
    lines.push("const data = await response.json();");
  }
  return lines.join("\n");
}

export function responseBody(response) {
  if (!response) return null;
  if (response.json !== undefined) return { lang: "json", code: JSON.stringify(response.json, null, 2) };
  if (response.text !== undefined) return { lang: response.lang ?? "text", code: response.text };
  return null;
}
