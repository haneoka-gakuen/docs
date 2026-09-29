import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const pages = (await getCollection("docs")).filter((page) => !page.id.startsWith("zh-cn/"));
  const sections = pages.map((page) => {
    const slug = page.slug.replace(/(?:^|\/)index$/, "");
    return `# ${page.data.title}\n\nSource: https://docs.haneoka.org/${slug ? `${slug}/` : ""}\n\n${page.body}`;
  });
  return new Response(sections.join("\n\n---\n\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
