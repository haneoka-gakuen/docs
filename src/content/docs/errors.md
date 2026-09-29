---
title: Errors and retries
description: Read structured failures and choose a safe retry policy.
---

## Error body

Worker JSON APIs use this envelope for failures:

```json
{
  "error": {
    "code": "entity_not_found",
    "message": "Catalog entity not found",
    "requestId": "request-id-when-available"
  }
}
```

`requestId` is present on the generic release/catalog worker error path. Account, community, and upload handlers may return the same `{ error: { code, message } }` shape without that field. Always branch on HTTP status first and treat unknown fields as optional.

## Common status classes

| Status | Meaning | Client action |
| --- | --- | --- |
| `400` | Malformed query, cursor, route, or JSON | Fix the request; do not retry unchanged. |
| `401` | A session is required | Sign in, then retry with credentials. |
| `403` | Same-origin, verification, account, or permission check failed | Fix the browser/request context or show the user the required step. |
| `404` | Server, release, resource, entity, view, relation, or media is absent | Remove the item from the current view or refresh the registry. |
| `409` | Version, idempotency, or state conflict | Re-read the resource and apply the operation to the new version. |
| `413` / `415` | Body or media type exceeds the contract | Reduce or convert the request. |
| `422` | Body field or semantic validation failed | Fix the named field. |
| `429` | Rate limit or quota reached | Honor `Retry-After` when present and use backoff. |
| `500` | Unexpected worker failure | Retry with backoff if the operation is safe. |
| `502` | Upstream, release object, or provider projection failed | Retry with backoff; preserve the request ID. |
| `503` | Database, release, authentication, storage, or provider unavailable | Retry with backoff when the operation is safe. |

For idempotent public GETs, an exponential backoff is appropriate for `408`, `429`, and `5xx`. For mutations, retry only when the endpoint defines idempotency or the operation is explicitly safe to repeat. Upload intents require `Idempotency-Key`; reusing the same key with different file metadata returns `409 idempotency_conflict`.

## Stable endpoint errors

The route pages list validation codes that are useful to a caller. Error codes are stable identifiers, while messages are for display and diagnostics. Unknown error codes must be handled as an opaque failure.
