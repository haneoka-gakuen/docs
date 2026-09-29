---
title: Profiles, relationships, and preferences
description: Read public profiles and manage the signed-in account profile.
---

## Public profile

```http
GET /api/v1/community/users/{uid}?limit=24
```

`uid` is the public numeric UID returned in another profile or authored-content response. The response includes:

```json
{
  "profile": {
    "uid": 1001,
    "displayName": "Example user",
    "handle": "example-user",
    "bio": null,
    "avatarSeed": "opaque-avatar-seed",
    "avatarUrl": null,
    "joinedAt": 1730000000000,
    "owner": false,
    "role": "member",
    "stats": { "followers": 0, "following": 0, "gameAccounts": 0, "posts": 0, "works": 0 }
  },
  "viewer": { "blocked": false, "followedBy": false, "following": false, "muted": false, "canInteract": false },
  "posts": [],
  "postsNextCursor": null,
  "works": [],
  "gameAccounts": []
}
```

Public posts are cursor-paginated (`limit` defaults to 24 and is capped at 50). A viewer who blocks either side receives an empty post/work/account projection. Game account fields are public snapshots selected by the account owner.

## Signed-in profile

```http
GET /api/v1/account/profile
PATCH /api/v1/account/profile
DELETE /api/v1/account/profile
```

The GET response is `{ "profile": ... }` with account name, public UID, handle, bio, display-name moderation status, avatar fields, role, profile status, and a monotonic `version`.

Patch only the fields being changed:

```json
{
  "displayName": "New display name",
  "handle": "new-handle",
  "bio": "Short biography",
  "version": 4
}
```

`displayName` is 1–80 visible characters, `handle` is 3–32 lowercase letters/numbers/underscore/hyphen and cannot be numeric-only, and `bio` is at most 500 characters. `null` clears `handle` or `bio`. Display names are moderated and can return `202` with a pending status. A stale version returns `409 profile_conflict`; an occupied handle returns `409 handle_unavailable`.

Delete requires an email-verified session and:

```json
{ "confirmation": "the-current-account-email" }
```

Successful deletion returns `204` and clears cookies. The last active administrator cannot delete the account until administrator access is transferred.

## Relationships

```http
PUT /api/v1/community/users/{uid}/follow
PUT /api/v1/community/users/{uid}/block
PUT /api/v1/community/users/{uid}/mute
```

Each accepts `{ "active": true }` or `{ "active": false }` and returns the relationship state. `uid` is a public UID, not a private user ID. Blocking affects visibility and interaction; clients should re-read the public profile after changing it.

## Preferences

```http
GET /api/v1/me/preferences
PUT /api/v1/me/preferences
```

The response is `{ "preferences": null }` for a new account or:

```json
{
  "preferences": {
    "locale": "zh-CN",
    "releaseServer": "jp-cbt",
    "settings": { "density": "comfortable" },
    "version": 2,
    "updatedAt": 1730000000000
  }
}
```

PUT merges omitted keys with stored values; explicit `null` clears a field. Supported locales are `ja`, `en`, `zh-TW`, `zh-CN`, and `ko`; settings are limited to 16 KiB.

## Avatar

Set or clear the signed-in avatar:

```http
PUT /api/v1/account/avatar
Content-Type: image/webp

<binary image>

DELETE /api/v1/account/avatar
```

JPEG, PNG, and WebP images up to 2 MiB are accepted, with a maximum dimension of 4096 and 16 million pixels. A successful PUT returns `202 { "avatar": { "status": "pending" } }` while moderation runs.

Read a ready avatar:

```http
GET /api/v1/account/avatar/{userId}
```

The `userId` path segment is the opaque account identifier used by the profile's avatar URL. Missing or unapproved avatars return `404 avatar_not_found`.
