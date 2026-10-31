---
title: Vega 宿主資源埠
description: 提供本地位元組與渲染 URI，取消讀取並管理明確的資源租約。
---

[Haneoka 主站](https://haneoka.org/) · [瀏覽器劇情教程](../vega/)

`@haneoka/vega/host-resources` 匯出 `HostStoryResourceResolver`、`StoryResourceResolver` 和 `StoryResourceLease`。這個小入口可在 Node 或原生宿主中執行，不觸發瀏覽器 I/O。你提供的 host 決定儲存、快取、允許的資源名稱及渲染器能識別的 URI。

Engine 透過 **`engine.createPlayer({ resources })`** 接入，這是 `VegaPlayerOptions` 欄位。同一完整埠會傳給 renderer、ADV loader 和 UI。應用擁有注入的埠，播放器和 Engine 只釋放自己取得的租約。現有 Engine 的播放器呈現層及預設 renderer 使用瀏覽器 DOM；此入口提供資源 I/O 邊界。

## 1. 構建原始碼入口

公開包出口已提交到 Vega `dfb720d13cada667bd07072cb163942b6c70d0b3`，npm 仍待發布。使用原始碼構建或匹配的本地包。現有託管 `embed/vega.js` 是瀏覽器嵌入 facade，使用自己的引數。

原始碼構建前，安裝 Node.js 22.13 或更新版本，並確認 Corepack 命令可用，再執行下面的命令。這套原始碼構建工具使用 pnpm 11.14.0；執行已構建的資源例子需要 Node 20 或更新版本，見第 2 步。

```sh
git clone https://github.com/haneoka-gakuen/vega.git
cd vega
git checkout dfb720d13cada667bd07072cb163942b6c70d0b3
corepack enable
corepack prepare pnpm@11.14.0 --activate
pnpm install --frozen-lockfile
pnpm --filter @haneoka/vega-protocol build
pnpm build:core
```

入口產物為 `dist/host-resources.js`，宣告入口為 `dist/host-resources-entry.d.ts`。已連結此原始碼包的 workspace 可直接 import `@haneoka/vega/host-resources`。分發時保留入口旁的相對資源模組。

## 2. 執行完整本地檔案例子

儲存 [host-resources.mjs](/examples/host-resources.mjs) 和 [garden.svg](/examples/garden.svg)，放到同一目錄。使用 Node 20 或更新版本，在此目錄執行並傳入實際已構建入口：

```sh
node host-resources.mjs ../vega/dist/host-resources.js ./garden.svg
```

原始碼目錄在其他位置時修改入口路徑。指令碼能找到已連結包時，預設使用包出口：

```sh
node host-resources.mjs
```

完整指令碼將 `asset://my-story/background` 對映到本地 SVG，讀取編碼位元組，比較獨立可變副本和共享只讀檢視，取得兩個租約，取消尚未啟動的讀取，再關閉資源 scope。最後關閉底層檔案 host，清空它的常駐位元組。終端會輸出位元組數、URI 及相等的取得/釋放次數。

返回的 `asset://` URI 供已註冊該應用資源協議的原生 renderer 使用。此例在終端列印它；renderer adapter 決定如何呈現。瀏覽器 host 可在 `resolveRenderable` 建立 Blob URL，在對應 release 中撤銷。URI 由宿主選擇。

## 3. 實現完整 host 埠

```ts
import {
  HostStoryResourceResolver,
  type StoryResourceResolver,
  type StoryResourceLease,
} from "@haneoka/vega/host-resources";

const resources = new HostStoryResourceResolver(host);
```

這裡的 `host` 實現下述完整合同。可下載指令碼已經提供全部必需方法；只有 `load()` 的 adapter 屬於舊預設 resolver 的 adapter API。

| 方法 | 簽名 | 必填與作用 |
| --- | --- | --- |
| canLoad | `(source: string) => boolean` | 必填，同步判斷接受的協議和素材鍵。 |
| load | `(source: string, signal?: AbortSignal) => Promise<Uint8Array>` | 必填，讀取編碼位元組，並回應傳入的取消 signal。 |
| loadSharedBytes | `(source: string, signal?: AbortSignal) => Promise<Readonly<Uint8Array>>` | 可選，可信不可變常駐位元組的快速路徑，消費者保留該檢視。 |
| retain | `(source: string, signal?: AbortSignal) => Promise<StoryResourceLease>` | 必填，取得編碼資源租約，租約提供 `release(): void`。 |
| resolveRenderable | `(source: string, signal?: AbortSignal) => Promise<{ readonly url: string; readonly release: () => void }>` | 必填，提供 renderer 認識的 URI 與釋放函式。 |

host 擁有自行分配的位元組、檔案控制程式碼、快取、協議註冊或解碼物件；讀取失敗且尚未返回租約時，也由 host 清理部分分配。例子裡的 `host.dispose()` 是應用定義的快取清理方法，額外於 `StoryResourceResolver` 合同。

## scope 全部引數、結果與錯誤

構造器為 **`new HostStoryResourceResolver(host)`**，唯一必填引數是完整 `StoryResourceResolver`。預設宿主、URL 目錄、快取、位元組上限和期限由你的 host 配置。

| scope 方法 | 引數與結果 | 行為 |
| --- | --- | --- |
| canLoad | `source: string` → `boolean` | scope 有效時轉交 host；銷燬後返回 false。 |
| load | `source: string, signal?: AbortSignal` → `Promise<Uint8Array>` | 返回 host 位元組的新副本，修改副本不影響常駐檢視。 |
| loadSharedBytes | 同引數 → `Promise<Readonly<Uint8Array>>` | 返回可信 host 檢視；未提供快速路徑時呼叫 host.load，wrapper 不再複製。readonly 是呼叫約定，不是執行時凍結 buffer。 |
| retain | 同引數 → `Promise<StoryResourceLease>` | release 冪等；結束編碼資源消費者後呼叫。 |
| resolveRenderable | 同引數 → `Promise<{ readonly url: string; readonly release: () => void }>` | URI 原樣返回，release 冪等；先結束 renderer 的使用，再釋放。 |
| dispose | 無引數 → `void` | 關閉 scope，取消未完成獲取並釋放當前租約；重複呼叫無額外作用。 |

`source` 原樣傳給 host，路徑正規化、格式選擇、HTTP 請求、Blob 轉換和資源解析均由 host/provider 完成。不支援的 source 使非同步操作以 `TypeError` 拒絕，host I/O 錯誤保留原錯誤。

可選 `signal` 取消的是**獲取過程**：已取消時在 I/O 前按原 reason 拒絕；獲取中取消會轉發給 host，並立即結束該操作。已成功取得的租約繼續有效，直到顯式 release 或 scope.dispose，之後取消獲取 signal 不會自動釋放成功租約。

host 應回應收到的 signal。取消後才返回的租約會立即釋放；晚釋放出錯時輸出診斷，原取消仍是該操作的結果。scope.dispose 後非同步呼叫以 `AbortError` 拒絕。dispose 會嘗試釋放所有當前租約，再把釋放錯誤彙總為 `AggregateError`。釋放函式最多呼叫一次，即使第一次釋放拋錯。

## 4. 注入 Engine，並按所有權關閉

在使用 Engine 入口的應用中，可以用這個函式把完整 caller-owned 埠交給播放器。引數分別是實際容器、`AdvStory` 和資源 scope：

```ts
import { createVega, type AdvStory } from "@haneoka/vega/engine";
import type { StoryResourceResolver } from "@haneoka/vega/host-resources";

export async function mountWithResources(
  mount: HTMLElement,
  story: AdvStory,
  resources: StoryResourceResolver,
) {
  const engine = createVega();
  try {
    const player = await engine.createPlayer({ mount, story, resources, shell: false });
    return { player, close: () => engine.dispose() };
  } catch (error) {
    try { await engine.dispose(); }
    catch (cleanupError) {
      throw new AggregateError([error, cleanupError], "Player setup and Engine cleanup failed");
    }
    throw error;
  }
}
```

`resources?: StoryResourceResolver` 是**播放器引數**，不是 `VegaEngineOptions` 構造欄位或 embed `mountStory` 引數。省略時沿用 `DefaultStoryResourceResolver` 和原 resource plugin 路徑。HostStoryResourceResolver 是一種 scope 實現，也可以注入其他完整埠。

可從[完整劇情 JSON](https://docs.haneoka.org/examples/dialogue-zh.json)開始準備 `AdvStory`，格式與瀏覽器載入步驟見[劇情教程](../vega/)。宿主 renderer 應識別埠返回的 URI；預設 DOM renderer 使用瀏覽器可呈現地址。

| 所有者 | 清理責任 |
| --- | --- |
| Player/Engine | 自己的 loader、scene 和 UI 租約。await player.dispose 關閉該播放器，await engine.dispose 關閉其播放器和 Engine 自有 contributions。 |
| 應用 | 注入的資源 scope，在所有消費者結束後關閉，可由多個播放器共享。 |
| 檔案/原生 host | 自有儲存、常駐快取、worker 連線及部分分配，在使用它的 scope 結束後關閉。 |

關閉順序為 **await player/Engine 清理 → resources.dispose → 你定義的 host.dispose**。將 scope 和 host 清理放入巢狀 finally，確保釋放出錯後仍能清理後續所有者。播放器構造失敗會清理它取得的資源，同時保留 caller scope；關閉一個播放器也保留其他播放器正在共享的 scope。
