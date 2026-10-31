---
title: Sonolus API
description: 在 Sonolus 中開啟 Haneoka，獲取譜面、歌單與演出資源。
---

在 Sonolus 中新增伺服器 **`https://haneoka.org`**，也可以[直接在客戶端開啟](https://open.sonolus.com/haneoka.org)。客戶端請求介面時會自行追加 `/sonolus`。條目中的 `source` 同樣使用這一伺服器地址。

服務提供 Our Notes 與 GBP 譜面、按歌曲整理的歌單、音符皮膚、背景、音效、原生粒子特效及演奏引擎。公開介面支援 `GET` 和 `HEAD`，JSON 回應帶有 `Sonolus-Version` 標頭。

## 伺服器資訊

```http
GET /sonolus/info
```

回應提供標題、入口分割槽、設定與橫幅。資源描述中會給出下載地址，直接使用返回的地址讀取檔案即可。

## 譜面

```http
GET /sonolus/levels/info
GET /sonolus/levels/list?page=0
GET /sonolus/levels/{levelName}
GET /sonolus/levels/{levelName}/data/{sha1}
```

列表每頁 20 個條目，頁碼從零開始。關卡名稱標明本站、遊戲伺服器、歌曲與難度：

```text
haneoka-jp-100109-expert
haneoka-intl-100109-expert
haneoka-gbp-1234-expert
```

請求時使用列表返回的完整名稱。遊戲資料更新後，名稱保持穩定。客戶端顯示編號時會自動新增 `#`，因此 API 的 `name` 不帶井號。構造請求地址時，對完整名稱使用 URL 路徑編碼即可。

```http
GET /sonolus/levels/haneoka-jp-100109-expert
```

每個關卡提供引擎、演出資源、封面、音訊與譜面資料。`data` 物件包含壓縮譜面的地址和 40 位 SHA-1 摘要；直接讀取這個地址即可。摘要用於標識內容，檔案可長期快取。

在 `/sonolus/levels/info` 或 `/sonolus/levels/list` 後新增 `?type=random`，可以獲取隨機譜面。

## 歌曲歌單

```http
GET /sonolus/playlists/info
GET /sonolus/playlists/list?page=0
GET /sonolus/playlists/{playlistName}
```

歌單按歌曲整理各個難度，並提供完整關卡條目。`haneoka-jp-100109`、`haneoka-gbp-1234` 等名稱保留來源資訊。歌單名稱的 URL 編碼方式與關卡相同。

## 演出資源

```http
GET /sonolus/skins/list
GET /sonolus/backgrounds/list
GET /sonolus/effects/list
GET /sonolus/particles/list
GET /sonolus/engines/list
```

這些列表提供可選條目和檔案地址。音符皮膚與粒子特效的縮圖展示實際資源；紋理、音訊和引擎資料均透過返回的資源地址下載。

## 客戶端語言

顯示文字可以使用 Sonolus 1.1.3 及以上版本支援的 `##LOCALIZE`：

```text
##LOCALIZE:{"en":"Song","ja":"曲","zhs":"歌曲","zht":"歌曲","ko":"노래"}
```

客戶端按當前語言選擇文字，收藏中的條目也可隨語言切換。缺少對應翻譯時，採用物件中的第一個語言。其他工具展示這些欄位時，可解析 `##LOCALIZE:` 後面的 JSON，選擇所需語言並使用同樣的回退順序。簡體中文鍵為 `zhs`，繁體中文鍵為 `zht`。

`localization` 引數可指定伺服器標籤優先採用的回退語言。條目名稱、`source`、資源地址與摘要保持原值。

## GBP 曲庫

```http
GET /sonolus/levels/list?source=bestdori&page=0
GET /sonolus/playlists/list?source=bestdori&page=0
```

這個來源引數選擇 GBP 曲庫，返回的關卡和歌單名稱使用 `haneoka-gbp-` 字首。需要歌曲、角色等資料來製作其他介面時，可讀取[GBP 資料介面](../providers/bestdori/)。

## 回應狀態

不存在的名稱返回 `404`，正文為 `{ "message": "Not found" }`。暫時無法讀取曲庫時返回 `503`，正文為 `{ "message": "Service unavailable" }`。這些公開讀取介面無需帳號會話；`Sonolus-Session` 可作為協議標頭髮送。
