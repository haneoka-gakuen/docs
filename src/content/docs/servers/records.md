---
title: Rankings and public game profiles
description: Read song rankings, event tracking and public profiles by game region.
---

Game records are public read-only projections of [Moenotes](https://bdon.moe/) data. The `region` path is `jp`, `tw`, `en` or `kr`; it is independent of a catalog `server` slug and of UI language. Use IDs returned by the corresponding record response and retain the provider's availability and visibility semantics.

## Song rankings and player profiles

```http
GET /api/v1/game/records/{region}/songs/{musicId}/ranking
GET /api/v1/game/records/{region}/players/{profileId}
```

```js
const response = await fetch("https://haneoka.org/api/v1/game/records/en/songs/100070/ranking");
const result = await response.json();
if (!response.ok) throw new Error(result.error.kind);
for (const row of result.rows) {
  console.log(row.rank, row.tied, row.name, row.score);
}
const profileId = result.rows.find(row => row.profileId)?.profileId;
if (profileId) {
  const profileResponse = await fetch(
    `https://haneoka.org/api/v1/game/records/en/players/${encodeURIComponent(profileId)}`,
  );
  console.log(profileResponse.status, await profileResponse.json());
}
```

Ranking results contain `region`, `musicId`, `rows`, `fetchedAtMs`, `serverTimeMs` and `stale`. Times are milliseconds or null. Rows contain rank/tied, public playerId/profileId/name, score, rankExp, favoriteMemberCardId, deckId/deckName/totalPower, profileCard and cards. Missing source fields remain null. A profile card retains name, slot and all legal `thumbnailUrls`; select the page your UI needs. Card rows keep slot, memberCardId/memberExp/memberAwakeCount/memberRank and supportCardId/supportExp/supportRank; calculate levels only with the matching catalog thresholds.

Song ranks sort by score, preserve source order within ties, and use competition ranks for equal scores. Use `tied` for tie presentation. A profile response contains the public profile's name, level/rankExp, favorite member card, profile card, totalFavorite and lastUpdatedAtMs. A hidden/unavailable profile follows the upstream failure; the endpoint gives no access to private account data.

## Current events and ranking snapshots

```http
GET /api/v1/game/records/{region}/events/current
GET /api/v1/game/records/{region}/events/{eventId}/latest
GET /api/v1/game/records/{region}/events/{eventId}/challenges/{challengeId}/ranking
```

The prepared event-tracking update exposes current event metadata, point ranking and challenge ranking. Current event returns `{region,event,fetchedAtMs,stale}`; `event: null` is a successful no-current-event result. Event metadata supplies its ID, start/end/status, pointRankingEnabled/status and challenges with their IDs, music IDs, enabled/status, timing and rewardRanks. Event point results contain eventId, rows and freshness fields. Challenge results additionally contain challengeId and retain the provider's row order.

## Freshness and errors

Honor Cache-Control (`max-age=60`, `stale-while-revalidate=300` in the current handler), `stale` and fetch timestamps rather than claiming live game state. The gateway bounds each upstream request to four seconds and 512 KiB. GET/HEAD are available; HEAD has no body, and the public dispatcher handles OPTIONS and unsupported methods.

Record-specific failures use `{error:{kind,retryAfter}}`. `retryAfter` is seconds or null. Typical kinds are invalid_request, not_found, pending, timeout and upstream. Invalid IDs return400, absent data404, upstream failures502, and deadline failures504; upstream visibility/permission statuses can also propagate. Follow the returned status and retryAfter when supplied. Catalog/dispatcher failures use the separate code/message/requestId envelope described in [Errors](../../errors/).
