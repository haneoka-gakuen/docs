---
title: OpenAPI 參考
description: 下載並查看機器可讀的公開 API 契約。
---

產生的 OpenAPI 文件位於 [`/openapi.json`](/openapi.json)。每次正式建置前都會由 [`scripts/build-openapi.mjs`](https://github.com/haneoka-gakuen/docs/blob/main/scripts/build-openapi.mjs) 產生。

```bash
curl --fail-with-body https://docs.haneoka.org/openapi.json -o openapi.json
```

文件包含目前資料的直接別名：

```text
GET /api/v1/{resource}
GET /api/v1/{resource}/{id}
GET /api/v1/{resource}/views/{view}
GET /api/v1/{resource}/views/{view}/{id}
GET /api/v1/{resource}/relations/{relation}/{key}
```

每個直接路由都有選用的 `server` 查詢參數，省略時選擇 `intl`。文件也說明了伺服器範圍的明確形式、版本鎖定、媒體與遊戲用戶端檔案、Sonolus、社群／個人檔案／上傳 API、帳號設定、Better Auth 路由，以及 Bestdori 投影。

營運公告使用獨立的 `/api/v1/announcements` 路由。它們讀取目前伺服器的快照，不接受 `release` 參數；列表、詳情、媒體、語言與 HTML 呈現請見[營運公告](/servers/announcements/)。

供應者形態的 DTO 與目錄 DTO 在由所選資源決定欄位之處使用 `additionalProperties`。穩定的封裝與欄位語意請見[目錄資料](/servers/catalog/)，錯誤、批次、時間戳與媒體值請見[共用結構描述](/reference/schemas/)。
