---
title: 排行与公开游戏资料
description: 按游戏地区读取歌曲排行、活动追踪和公开玩家资料。
---

游戏记录为 [Moenotes](https://bdon.moe/) 的公开只读投影。region 是 jp/tw/en/kr，与 catalog server slug 和 UI 语言独立。使用对应响应提供的 ID，并遵循来源的资料公开性与可用状态。

## 歌曲排行与玩家

```http
GET /api/v1/game/records/{region}/songs/{musicId}/ranking
GET /api/v1/game/records/{region}/players/{profileId}
```

```js
const response = await fetch("https://haneoka.org/api/v1/game/records/en/songs/100070/ranking");
const result = await response.json();
if (!response.ok) throw new Error(result.error.kind);
for (const row of result.rows) console.log(row.rank, row.tied, row.name, row.score);
const profileId = result.rows.find(row => row.profileId)?.profileId;
if (profileId) {
  const profileResponse = await fetch(
    `https://haneoka.org/api/v1/game/records/en/players/${encodeURIComponent(profileId)}`,
  );
  console.log(profileResponse.status, await profileResponse.json());
}
```

结果含 region/musicId/rows/fetchedAtMs/serverTimeMs/stale，时间为毫秒或 null。row 保留 rank/tied、公开 playerId/profileId/name、score、rankExp、favoriteMemberCardId、deckId/deckName/totalPower、profileCard 与 cards。缺值保留 null。名片保存 name/slot 和全部合法 thumbnailUrls，由界面选择页面。

成员卡保留 slot/memberCardId/memberExp/memberAwakeCount/memberRank，留影卡保留 supportCardId/supportExp/supportRank；等级需匹配目录阈值计算。歌曲按分数排序，同分保留来源顺序并共享名次；tied 可用于显示并列。

公开 profile 包含 name、level/rankExp、favoriteMemberCard、profileCard、totalFavorite 和 lastUpdatedAtMs。隐藏或不可用资料沿用来源错误，接口不会提供私人账号数据。

## 活动快照

```http
GET /api/v1/game/records/{region}/events/current
GET /api/v1/game/records/{region}/events/{eventId}/latest
GET /api/v1/game/records/{region}/events/{eventId}/challenges/{challengeId}/ranking
```

活动追踪属于准备发布的更新。current 返回 region/event/fetchedAtMs/stale，event:null 是当前无活动的成功响应。event 包含 id/startAtMs/endAtMs/status、pointRankingEnabled/Status，以及挑战的 id/musicId/enabled/status/时间/rewardRanks。点数快照有 eventId/rows/新鲜度字段；挑战额外有 challengeId，沿用来源行序。

## 新鲜度与恢复

遵守 Cache-Control（当前 handler 为 max-age60、stale-while-revalidate300）、stale 与抓取时间。上游每次限制4秒及512KiB。GET/HEAD 可用，HEAD 无正文；dispatcher 处理 OPTIONS 和不支持的方法。

本业务失败 envelope 为 error.kind/retryAfter，retryAfter 是秒或 null。kind 包括 invalid_request、not_found、pending、timeout、upstream。非法 ID400，无资料404，上游502，超时504；来源权限/公开性状态也可能转交。按 status 和 retryAfter 恢复。catalog/dispatcher 的 code/message/requestId 契约见 [错误](../../errors/)。
