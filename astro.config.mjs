import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://docs.haneoka.org",
  legacy: { collections: true },
  integrations: [
    starlight({
      title: "Haneoka Docs",
      description:
        "Public API and JavaScript embedding guides for Haneoka catalogs, stories, charts, scenes and community services.",
      favicon: "/favicon.svg",
      customCss: ["./src/styles/md3.css", "./src/styles/api-reference.css"],
      components: { SocialIcons: "./src/components/MainSiteSocialLinks.astro" },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/haneoka-gakuen/haneoka",
        },
      ],
      locales: {
        root: { label: "English", lang: "en" },
        ja: { label: "日本語", lang: "ja" },
        ko: { label: "한국어", lang: "ko" },
        "zh-tw": { label: "繁體中文", lang: "zh-TW" },
        "zh-cn": { label: "简体中文", lang: "zh-CN" },
      },
      defaultLocale: "root",
      sidebar: [
        { label: "Public APIs and image exports", translations: { ja: "公開 API と画像保存", ko: "공개 API와 이미지 내보내기", "zh-CN": "公开 API 与图片导出", "zh-TW": "公開 API 與圖片匯出" }, items: ["guides/game-api", "guides/local-computation", "guides/image-exports", "reference/game", "reference/images", "reference/tools", "reference/chart-images"] },
        { label: "Haneoka.org", link: "https://haneoka.org/", translations: { "zh-CN": "Haneoka 主站" } },
        {
          label: "Start here",
          translations: { "zh-CN": "开始使用" },
          items: ["quickstart", "conventions", "errors"],
        },
        {
          label: "Creation tools",
          translations: { "zh-CN": "创作工具" },
          items: ["creation/stamp-maker", "creation/chart-editor"],
        },
        {
          label: "Catalog data",
          translations: { "zh-CN": "资料目录" },
          items: ["servers/catalog", "servers/client", "servers/chart-images", "servers/records"],
        },
        {
          label: "JavaScript embeds",
          translations: { "zh-CN": "JavaScript 嵌入" },
          items: ["embed", "embed/core", "embed/vega", "embed/cassiopeia", "embed/home-spot"],
        },
        {
          label: "The suite",
          translations: { "zh-CN": "套件" },
          items: ["suite", "suite/vega", "suite/altair", "suite/deneb", "suite/cassiopeia"],
        },
        {
          label: "Operational data",
          translations: { "zh-CN": "运营数据" },
          items: ["servers/announcements"],
        },
        {
          label: "Sonolus",
          translations: { "zh-CN": "Sonolus" },
          items: ["sonolus"],
        },
        {
          label: "Community",
          translations: { "zh-CN": "社区" },
          items: [
            "community",
            "community/profiles",
            "community/posts",
            "community/uploads",
          ],
        },
        {
          label: "Authentication",
          translations: { "zh-CN": "身份验证" },
          items: ["auth"],
        },
        {
          label: "Provider APIs",
          translations: { "zh-CN": "提供商 API" },
          items: ["providers/bestdori"],
        },
        {
          label: "Advanced server contracts",
          translations: { "zh-CN": "高级服务器接口" },
          items: [
            "servers/releases",
            "servers/media",
            "servers/game-client",
            "servers/sources",
          ],
        },
        {
          label: "Reference",
          translations: { "zh-CN": "参考" },
          items: ["reference/openapi", "reference/schemas"],
        },
      ],
    }),
  ],
});
