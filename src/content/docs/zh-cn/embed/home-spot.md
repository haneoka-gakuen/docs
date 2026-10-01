---
title: Home Spot 场景嵌入
description: 挂载本站或自带 Three/Spine 场景，选择角色、重播并导出 PNG。
---

`@haneoka/embed-home-spot` 在宿主容器创建场景，沿用公开 scene provider 的相机、动画、图层、hit testing、解码和 WebGL 生命周期。嵌入层接入 core 数据源及 encoded bytes。候选包分发见 [嵌入入口](../)。provider 与 embed 应来自匹配版本，运行依赖为 Three 0.184.x 和 Spine 4.2.119；Spine 使用其自身 runtime license。

## 用 ID 挂载本站场景

```js
import { mountHaneokaHomeSpot } from "@haneoka/embed-home-spot/haneoka";
const spot = mountHaneokaHomeSpot(document.querySelector("#spot"), {
  spotId: 40002,
  server: "intl",
  locale: "en",
  ariaLabel: "Garage scene",
  onEvent(event) { if (event.type === "error") console.error(event.error); },
});
try {
  await spot.ready;
  spot.update({ selectedCharacterId: 31 });
  spot.replay();
  const png = await spot.exportPng({ width: 1920, height: 1080 });
  // png 为 Blob，宿主可以预览、上传或下载。
} finally {
  await spot.dispose();
}
```

容器由宿主提供，例如 `<div id="spot"></div>`。适配器读取 latest stories 文档并选 `homeSpots[spotId].spine`；现有 API 以一个文档提供这些数据。使用返回的资源路径，无需账号或 release。便捷 mount 为公开传输设置 no-referrer，保留 credentials、signal 与自定义 fetcher；手动组合低级 source 时也可设置此公开资源策略。语言与 server 独立。

## 自带完整场景

自带 scene 包含 GLB 背景、背景矩阵、atlas、Spine layer 与相机。自包含 GLB 内嵌 image/buffer，atlas 页面和 skeleton 经 resolver 提供。

```js
import { mountHomeSpot } from "@haneoka/embed-home-spot";
import { fileResourceResolver } from "@haneoka/embed-core";
const identity = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
const scene = {
  supported: true,
  backgroundScene: "room.glb",
  backgroundTransform: identity,
  atlas: "actors/actor.atlas",
  scale: 0.01,
  camera: {
    position: [0,0,-5], startPosition: [0,0,-5], target: [0,0,0],
    fieldOfView: 20, introDuration: 0,
  },
  layers: [{
    key: "actor", runtime: { json: "actors/actor.json" },
    animation: "idle", sortingOrder: 0, transform: identity,
  }],
};
const resources = new Map([
  ["room.glb", roomGlbFile],
  ["actors/actor.atlas", atlasFile],
  ["actors/actor.json", skeletonFile],
  ["actors/actor.png", textureFile],
]);
const spot = mountHomeSpot(element, {
  document: scene,
  resolveResource: fileResourceResolver(resources),
  locale: "fr",
  ariaLabel: "Une scène originale",
});
await spot.ready;
```

File 变量由文件选择器或桌面宿主取得，key 支持 Unicode。JSON skeleton 使用 runtime.json，二进制使用 runtime.skel，与安装的 Spine 4.2 匹配；animation 名称必须存在于 skeleton。相机向量和 row-major layer transform 使用 provider 的 Unity 坐标，GLB backgroundTransform 为 column-major。场景围绕原点制作时可用 identity。layer 可加 characterId 和本地 hitPolygon，保留独立 sortingOrder。

## HTTP 与资源路径

```js
import { httpDataSource } from "@haneoka/embed-core";
const spot = mountHomeSpot(element, {
  source: httpDataSource({ url: "https://media.example/projects/cafe/scene.json" }),
  ariaLabel: "Cafe",
});
await spot.ready;
```

room.glb 基于 scene.json 目录解析，actors/actor.atlas 的 actor.png 基于 atlas 目录解析。根路径使用资源 origin，绝对地址保留自身 origin。assetsBase 可以覆盖为另一个绝对目录，resolveResource 可返回 URL/string/Blob。HTTP/file/内存数据使用相同资源端口。

默认 cors/omit，每项 64 MiB，可设置 maxBytes、fetcher 与 credentials。跨域公开资源允许宿主 origin；cookie 资源需显式允许 origin 和凭据。HTTP 失败、scene 不可用、skeleton 不兼容与 CORS 拒绝会拒绝 ready 并产生 error。

## 替换、取消与释放

mount 立即返回 handle，ready 指向最新 load：

```js
const spot = mountHomeSpot(host, { source, signal: componentSignal });
spot.ready.catch(showLoadError);
// 加载途中也可以：await spot.dispose()。
await spot.ready;
spot.update({ selectedCharacterId: 31 });
spot.replay();
await spot.load({ document: anotherScene });
await spot.dispose();
```

load 取消并清理上一代，返回本代 Promise。cancel 只取消当前加载代次；已完成场景保留，之后可用新 source/document 再 load。带 dispose 的 source 按单 load 所有权使用，每次创建新的 source。dispose 幂等、拆除 DOM/监听/场景/source，已销毁 handle 不能复用；清理失败以 aggregate error 拒绝。

update 选择或重播，不重建资源；resize 请求更新视口，provider 也观察容器。修改几何、相机或资源使用 load。

## 事件、导出与布局

事件包括 loading、ready、cancelled、error、selection、contextlost、contextrestored、disposed；resource 事件包裹 core operation/key/loaded/total。subscribe 返回取消监听函数，onListenerError 隔离观察者异常。

exportPng 返回当前帧 PNG Blob，按 GPU 限制渲染指定尺寸后恢复互动视口。保持比例可保留构图；它不推进动画，调用方创建的预览 URL 自行 revoke。

组件从挂载开始预留 16:9 空间，可用 aspectRatio 指定其他比例。canvas 填满区域，clearColor 默认读取宿主 MD3 surface token。组件只拥有自己的子元素，页面的其他子节点由宿主保留。

Haneoka 原图标链接位于宿主边角，在游戏 canvas 和 PNG 之外。用已有 Material 按钮提供 replay、selection、export 与加载状态，本地化 ariaLabel 和按钮文字；键盘选择可通过宿主按钮调用 update。场景使用原 PNG，压缩纹理与 PMA 支持由 scene provider 和实际 descriptor 决定。
