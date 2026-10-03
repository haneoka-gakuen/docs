---
title: Vega 宿主资源端口
description: 提供本地字节与渲染 URI，取消读取并管理明确的资源租约。
---

[Haneoka 主站](https://haneoka.org/) · [浏览器剧情教程](../vega/)

`@haneoka/vega/host-resources` 导出 `HostStoryResourceResolver`、`StoryResourceResolver` 和 `StoryResourceLease`。这个小入口可在 Node 或原生宿主中运行，不触发浏览器 I/O。你提供的 host 决定储存、缓存、允许的资源名称及渲染器能识别的 URI。

Engine 通过 **`engine.createPlayer({ resources })`** 接入，这是 `VegaPlayerOptions` 字段。同一完整端口会传给 renderer、ADV loader 和 UI。应用拥有注入的端口，播放器和 Engine 只释放自己取得的租约。现有 Engine 的播放器呈现层及默认 renderer 使用浏览器 DOM；此入口提供资源 I/O 边界。

## 1. 构建源码入口

公开包出口已提交到 Vega `dfb720d13cada667bd07072cb163942b6c70d0b3`，npm 仍待发布。使用源码构建或匹配的本地包。现有托管 `embed/vega.js` 是浏览器嵌入 facade，使用自己的参数。

源码构建前，安装 Node.js 22.13 或更新版本，并确认 Corepack 命令可用，再执行下面的命令。这套源码构建工具使用 pnpm 11.14.0；运行已构建的资源例子需要 Node 20 或更新版本，见第 2 步。

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

入口产物为 `dist/host-resources.js`，声明入口为 `dist/host-resources-entry.d.ts`。已链接此源码包的 workspace 可直接 import `@haneoka/vega/host-resources`。分发时保留入口旁的相对资源模块。

## 2. 运行完整本地文件例子

保存 [host-resources.mjs](/examples/host-resources.mjs) 和 [garden.svg](/examples/garden.svg)，放到同一目录。使用 Node 20 或更新版本，在此目录执行并传入实际已构建入口：

```sh
node host-resources.mjs ../vega/dist/host-resources.js ./garden.svg
```

源码目录在其他位置时修改入口路径。脚本能找到已链接包时，默认使用包出口：

```sh
node host-resources.mjs
```

完整脚本将 `asset://my-story/background` 映射到本地 SVG，读取编码字节，比较独立可变副本和共享只读视图，取得两个租约，取消尚未启动的读取，再关闭资源 scope。最后关闭底层文件 host，清空它的常驻字节。终端会输出字节数、URI 及相等的取得/释放次数。

返回的 `asset://` URI 供已注册该应用资源协议的原生 renderer 使用。此例在终端打印它；renderer adapter 决定如何呈现。浏览器 host 可在 `resolveRenderable` 创建 Blob URL，在对应 release 中撤销。URI 由宿主选择。

## 3. 实现完整 host 端口

```ts
import {
  HostStoryResourceResolver,
  type StoryResourceResolver,
  type StoryResourceLease,
} from "@haneoka/vega/host-resources";

const resources = new HostStoryResourceResolver(host);
```

这里的 `host` 实现下述完整合同。可下载脚本已经提供全部必需方法；只有 `load()` 的 adapter 属于旧默认 resolver 的 adapter API。

| 方法 | 签名 | 必填与作用 |
| --- | --- | --- |
| canLoad | `(source: string) => boolean` | 必填，同步判断接受的协议和素材键。 |
| load | `(source: string, signal?: AbortSignal) => Promise<Uint8Array>` | 必填，读取编码字节，并响应传入的取消 signal。 |
| loadSharedBytes | `(source: string, signal?: AbortSignal) => Promise<Readonly<Uint8Array>>` | 可选，可信不可变常驻字节的快速路径，消费者保留该视图。 |
| retain | `(source: string, signal?: AbortSignal) => Promise<StoryResourceLease>` | 必填，取得编码资源租约，租约提供 `release(): void`。 |
| resolveRenderable | `(source: string, signal?: AbortSignal) => Promise<{ readonly url: string; readonly release: () => void }>` | 必填，提供 renderer 认识的 URI 与释放函数。 |

host 拥有自行分配的字节、文件句柄、缓存、协议注册或解码对象；读取失败且尚未返回租约时，也由 host 清理部分分配。例子里的 `host.dispose()` 是应用定义的缓存清理方法，额外于 `StoryResourceResolver` 合同。

## scope 全部参数、结果与错误

构造器为 **`new HostStoryResourceResolver(host)`**，唯一必填参数是完整 `StoryResourceResolver`。默认宿主、URL 目录、缓存、字节上限和期限由你的 host 配置。

| scope 方法 | 参数与结果 | 行为 |
| --- | --- | --- |
| canLoad | `source: string` → `boolean` | scope 有效时转交 host；销毁后返回 false。 |
| load | `source: string, signal?: AbortSignal` → `Promise<Uint8Array>` | 返回 host 字节的新副本，修改副本不影响常驻视图。 |
| loadSharedBytes | 同参数 → `Promise<Readonly<Uint8Array>>` | 返回可信 host 视图；未提供快速路径时调用 host.load，wrapper 不再复制。readonly 是调用约定，不是运行时冻结 buffer。 |
| retain | 同参数 → `Promise<StoryResourceLease>` | release 幂等；结束编码资源消费者后调用。 |
| resolveRenderable | 同参数 → `Promise<{ readonly url: string; readonly release: () => void }>` | URI 原样返回，release 幂等；先结束 renderer 的使用，再释放。 |
| dispose | 无参数 → `void` | 关闭 scope，取消未完成获取并释放当前租约；重复调用无额外作用。 |

`source` 原样传给 host，路径正规化、格式选择、HTTP 请求、Blob 转换和资源解析均由 host/provider 完成。不支持的 source 使异步操作以 `TypeError` 拒绝，host I/O 错误保留原错误。

可选 `signal` 取消的是**获取过程**：已取消时在 I/O 前按原 reason 拒绝；获取中取消会转发给 host，并立即结束该操作。已成功取得的租约继续有效，直到显式 release 或 scope.dispose，之后取消获取 signal 不会自动释放成功租约。

host 应响应收到的 signal。取消后才返回的租约会立即释放；晚释放出错时输出诊断，原取消仍是该操作的结果。scope.dispose 后异步调用以 `AbortError` 拒绝。dispose 会尝试释放所有当前租约，再把释放错误汇总为 `AggregateError`。释放函数最多调用一次，即使第一次释放抛错。

## 4. 注入 Engine，并按所有权关闭

在使用 Engine 入口的应用中，可以用这个函数把完整 caller-owned 端口交给播放器。参数分别是实际容器、`AdvStory` 和资源 scope：

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

`resources?: StoryResourceResolver` 是**播放器参数**，不是 `VegaEngineOptions` 构造字段或 embed `mountStory` 参数。省略时沿用 `DefaultStoryResourceResolver` 和原 resource plugin 路径。HostStoryResourceResolver 是一种 scope 实现，也可以注入其他完整端口。

可从[完整剧情 JSON](https://docs.haneoka.org/examples/dialogue-zh.json)开始准备 `AdvStory`，格式与浏览器加载步骤见[剧情教程](../vega/)。宿主 renderer 应识别端口返回的 URI；默认 DOM renderer 使用浏览器可呈现地址。

| 所有者 | 清理责任 |
| --- | --- |
| Player/Engine | 自己的 loader、scene 和 UI 租约。await player.dispose 关闭该播放器，await engine.dispose 关闭其播放器和 Engine 自有 contributions。 |
| 应用 | 注入的资源 scope，在所有消费者结束后关闭，可由多个播放器共享。 |
| 文件/原生 host | 自有储存、常驻缓存、worker 连接及部分分配，在使用它的 scope 结束后关闭。 |

关闭顺序为 **await player/Engine 清理 → resources.dispose → 你定义的 host.dispose**。将 scope 和 host 清理放入嵌套 finally，确保释放出错后仍能清理后续所有者。播放器构造失败会清理它取得的资源，同时保留 caller scope；关闭一个播放器也保留其他播放器正在共享的 scope。
