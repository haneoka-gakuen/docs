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
        { label: "Start here", translations: { "zh-CN": "开始使用", "zh-TW": "開始使用", ja: "はじめに", ko: "시작하기" }, items: ["quickstart", "conventions", "errors"] },
        {
          label: "Game data",
          translations: { "zh-CN": "游戏数据", "zh-TW": "遊戲資料", ja: "ゲームデータ", ko: "게임 데이터" },
          items: ["servers/catalog", "servers/search", "servers/records", "servers/announcements", "servers/media", "servers/releases", "servers/sources", "servers/client", "providers/bestdori"],
        },
        {
          label: "Images and computation",
          translations: { "zh-CN": "图片与计算", "zh-TW": "圖片與計算", ja: "画像と計算", ko: "이미지와 계산" },
          items: ["guides/image-exports", "servers/chart-images", "guides/local-computation", "creation/stamp-maker", "creation/chart-editor"],
        },
        {
          label: "Embeds",
          translations: { "zh-CN": "嵌入", "zh-TW": "嵌入", ja: "埋め込み", ko: "임베드" },
          items: ["embed", "embed/core", "embed/vega", "embed/cassiopeia", "embed/home-spot", "embed/host-resources"],
        },
        {
          label: "Open platform and community",
          translations: { "zh-CN": "开放平台与社区", "zh-TW": "開放平台與社群", ja: "オープンプラットフォームとコミュニティ", ko: "오픈 플랫폼과 커뮤니티" },
          items: ["guides/team-data", "community", "community/profiles", "community/posts", "community/uploads", "auth"],
        },
        { label: "Engines", translations: { "zh-CN": "引擎", "zh-TW": "引擎", ja: "エンジン", ko: "엔진" }, items: ["suite", "suite/vega", "suite/altair", "suite/deneb", "suite/cassiopeia", "sonolus"] },
        { label: "Reference", translations: { "zh-CN": "参考", "zh-TW": "參考", ja: "リファレンス", ko: "참조" }, items: ["reference/openapi", "reference/schemas", "reference/images", "reference/tools", "reference/chart-images"] },
      ],
    }),
  ],
});
