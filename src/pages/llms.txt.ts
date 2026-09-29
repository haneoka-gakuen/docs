import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const pages = (await getCollection("docs")).filter((page) => !page.id.startsWith("zh-cn/"));
  const links = pages.map((page) => {
    const slug = page.slug.replace(/(?:^|\/)index$/, "");
    return `- [${page.data.title}](https://docs.haneoka.org/${slug ? `${slug}/` : ""}): ${page.data.description || ""}`;
  });
  return new Response([
    "# Haneoka API",
    "> Public APIs for Our Notes resource catalogs, release-pinned media, Sonolus, GBP data and community integrations.",
    "",
    "## Machine-readable contract",
    "- [OpenAPI 3.1](https://docs.haneoka.org/openapi.json): Routes, request parameters, response schemas and authentication requirements.",
    "- [Complete documentation](https://docs.haneoka.org/llms-full.txt): All English guides in one text document.",
    "",
    "## Guides",
    ...links,
    "",
  ].join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
