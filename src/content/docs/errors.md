---
title: Errors and retries
description: Read structured failures and choose a safe retry strategy.
---

## Error response

JSON API failures use this envelope:

```json
{
  "error": {
    "code": "entity_not_found",
    "message": "Catalog entity not found",
    "requestId": "request-id-when-available"
  }
}
```

Branch on the HTTP status and stable `code`. Display `message` to a developer or log entry; it can become more specific. `requestId` is optional and is useful when reporting a service failure.

## Status guide

| Status | Meaning | Client action |
| --- | --- | --- |
| `400` | Invalid query, route value, JSON, or batch ID | Fix the request and send it again. |
| `401` | A session is required | Sign in and send the browser credentials. |
| `403` | Origin, verification, account, or permission check failed | Correct the request context or show the required user action. |
| `404` | Server, resource, entity, view, relation, or file was not found | Refresh the catalog or remove the missing item. |
| `409` | Version, idempotency, or state conflict | Re-read the resource and apply the change to the latest version. |
| `413` / `415` | Request is too large or uses an unsupported media type | Reduce the body or use the declared content type. |
| `422` | Body fields fail validation | Correct the fields named by the response. |
| `429` | Rate limit or quota reached | Follow `Retry-After` when present and use backoff. |
| `500` | Unexpected worker failure | Retry an idempotent read with backoff. |
| `502` | Upstream or provider projection failed | Retry the read with backoff and retain `X-Request-Id`. |
| `503` | Database, catalog, identity, or storage is unavailable | Retry a safe read with backoff. |

An unknown error code is an opaque failure. Preserve it in logs and use the status category for user-facing behavior.

## Retry policy

`GET` and `HEAD` requests are safe to retry after a network failure, `408`, `429`, and transient `5xx` responses. Use exponential backoff with jitter, respect `Retry-After`, and cap the number of attempts. Re-read a current alias after a transient failure; the current catalog may have changed by the time the retry succeeds.

Mutation requests need an operation-specific rule. Retry only when the endpoint defines idempotency or the operation is safe to repeat. Upload intents require an `Idempotency-Key`; reusing a key with different metadata returns `409 idempotency_conflict`.

## Common catalog failures

- `route_not_found`: the top-level path is not a public API route.
- `server_not_found`: the `server` query value is not active.
- `resource_not_found`: the resource is not in the selected catalog manifest.
- `entity_not_found`: the resource exists but the requested ID is absent.
- `view_not_found` or `relation_not_found`: the manifest does not define the requested view or relation.
- `release_not_found`: an advanced explicit request used an unavailable release ID.

The direct aliases use current data and do not require a release ID. See [Advanced server contracts](./servers/releases/) when a build needs to pin a historical release.
