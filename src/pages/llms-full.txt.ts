import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { REGISTRY, errorEntry } from "../data/api/index.mjs";
import { AUTH } from "../data/api/i18n.mjs";
import { endpointMarkdown } from "../data/api/render.mjs";

export const GET: APIRoute = async () => {
  const pages = (await getCollection("docs")).filter((page) => !/^(?:zh-cn|zh-tw|ja|ko)\//u.test(page.id));
  const sections = pages.map((page) => {
    const slug = page.slug.replace(/(?:^|\/)index$/, "");
    const body = page.body.replace(/^import Endpoint from .*\n/gmu, "").replace(/<Endpoint id="([^"]+)"\s*\/>/gu, (_, id) => {
      const entry = REGISTRY.get(id);
      if (!entry) throw new Error(`Unknown endpoint ${id}`);
      return endpointMarkdown(entry.endpoint, "en", REGISTRY, errorEntry, AUTH);
    });
    return `# ${page.data.title}\n\nSource: https://docs.haneoka.org/${slug ? `${slug}/` : ""}\n\n${body}`;
  });
  return new Response(sections.join("\n\n---\n\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
