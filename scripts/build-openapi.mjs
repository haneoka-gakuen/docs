import { mkdir, writeFile } from "node:fs/promises";

const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const anyObject = { type: "object", additionalProperties: true };
const anyDocument = { oneOf: [anyObject, { type: "array", items: {} }] };

const json = (schema, description = "JSON response", headers) => ({
  description,
  ...(headers ? { headers } : {}),
  content: { "application/json": { schema } },
});
const noContent = (description = "No content", headers) => ({
  description,
  ...(headers ? { headers } : {}),
});
const error = (description = "Structured API error") =>
  json(ref("Error"), description, { "X-Request-Id": { description: "Request correlation identifier.", schema: ref("RequestIdHeader") } });
const text = (description) => ({
  description,
  content: { "text/plain": { schema: { type: "string" } } },
});
const binary = (description, headers = rangeHeaders) => ({
  description,
  headers,
  content: { "*/*": { schema: { type: "string", format: "binary" } } },
});

const pathParam = (name, description, schema = { type: "string" }) => ({
  name,
  in: "path",
  required: true,
  description,
  schema,
});
const query = (name, schema, description, required = false) => ({
  name,
  in: "query",
  required,
  description,
  schema,
  style: "form",
  explode: true,
});
const headerParam = (name, schema, description, required = false) => ({
  name,
  in: "header",
  required,
  description,
  schema,
});
const body = (schema, description = "JSON request body") => ({
  required: true,
  description,
  content: { "application/json": { schema } },
});
const operation = (summary, responses, options = {}) => ({
  summary,
  ...(options.description ? { description: options.description } : {}),
  ...(options.operationId ? { operationId: options.operationId } : {}),
  ...(options.tags ? { tags: options.tags } : {}),
  ...(options.parameters ? { parameters: options.parameters } : {}),
  ...(options.requestBody ? { requestBody: options.requestBody } : {}),
  ...(options.security !== undefined ? { security: options.security } : {}),
  responses,
});
const ok = (schema, description, headers) => ({
  200: json(schema, description, headers),
});
const created = (schema, description, headers) => ({
  201: json(schema, description, headers),
});
const accepted = (schema, description, headers) => ({
  202: json(schema, description, headers),
});

const releaseHeaders = {
  "X-Haneoka-Release-Id": {
    description: "Immutable release selected for this server-scoped response.",
    schema: { type: "string", pattern: "^r-[a-f0-9]{20}$" },
  },
  "X-Haneoka-Source-Id": {
    description: "Source snapshot associated with the selected release.",
    schema: { type: "string" },
  },
};
const rangeHeaders = {
  "Accept-Ranges": {
    description: "The endpoint accepts single byte ranges.",
    schema: { type: "string", const: "bytes" },
  },
  "Content-Length": {
    description: "Length of the returned representation or range.",
    schema: { type: "integer", format: "int64", minimum: 0 },
  },
  "Content-Range": {
    description: "Returned range, or `bytes */size` on 416.",
    schema: { type: "string" },
  },
  ETag: {
    description: "Representation validator.",
    schema: { type: "string" },
  },
};
const binaryResponses = (description, notFound = "Object not found.") => ({
  200: binary(description),
  206: binary("Partial byte range."),
  404: text(notFound),
  416: {
    description: "The requested byte range is not satisfiable.",
    headers: rangeHeaders,
  },
});
const withHeaders = (responses, headers) =>
  Object.fromEntries(
    Object.entries(responses).map(([status, response]) =>
      /^2\d\d$/u.test(status) || status === "206"
        ? [
            status,
            {
              ...response,
              headers: { ...(response.headers || {}), ...headers },
            },
          ]
        : [status, response],
    ),
  );

const authSecurity = [{ cookieSession: [] }];
const releaseQuery = query(
  "release",
  { type: "string", pattern: "^r-[a-f0-9]{20}$" },
  "Immutable release ID from a prior response.",
);
const resourcePath = (path, summary, options = {}) => {
  const { parameters: extraParameters = [], ...operationOptions } = options;
  return {
    parameters: [
      pathParam(
        "server",
        "Active resource-server slug from GET /api/v1/releases.",
      ),
      ...extraParameters,
    ],
    get: operation(summary, options.responses ?? ok(anyObject), {
      ...operationOptions,
      operationId:
        options.operationId ?? `get${path.replace(/[^A-Za-z0-9]+/g, "-")}`,
      tags: options.tags ?? ["Resource servers"],
    }),
  };
};
const currentServerQuery = query(
  "server",
  { type: "string", pattern: "^[A-Za-z0-9][A-Za-z0-9-]{0,63}$" },
  "Active server slug. Omit this parameter to read the default intl server. Static top-level groups such as releases, servers, account, me, community, and garupa are separate routes.",
);
const latestResourcePath = (path, summary, options = {}) => {
  const { parameters: extraParameters = [], ...operationOptions } = options;
  const response = options.responses ?? ok(anyObject);
  return {
    parameters: [
      pathParam(
        "resource",
        "Resource name declared in the selected catalog manifest.",
      ),
      currentServerQuery,
      ...extraParameters,
    ],
    get: operation(summary, withHeaders(response, releaseHeaders), {
      ...operationOptions,
      operationId:
        options.operationId ?? `getLatest${path.replace(/[^A-Za-z0-9]+/g, "-")}`,
      tags: options.tags ?? ["Latest resource API"],
    }),
  };
};
const readPath = (parameters, summary, responses, options = {}) => ({
  parameters,
  get: operation(summary, responses, options),
});

const paths = {
  "/api/v1/releases": {
    get: operation("List active resource servers", ok(ref("ReleaseRegistry")), {
      operationId: "listReleases",
      tags: ["Resource servers"],
    }),
  },
  "/api/v1/account/config": {
    get: operation("Read authentication availability", ok(ref("AuthConfig")), {
      operationId: "getAccountConfig",
      tags: ["Authentication"],
    }),
  },
  "/api/v1/account/register": {
    post: operation(
      "Request email registration",
      {
        202: json(
          {
            type: "object",
            properties: { accepted: { type: "boolean", const: true } },
            required: ["accepted"],
          },
          "Accepted without revealing account existence.",
        ),
        400: error(),
        403: error(),
        413: error(),
        415: error(),
        429: error(),
        503: error(),
      },
      {
        operationId: "registerByEmail",
        tags: ["Authentication"],
        requestBody: body(ref("RegistrationRequest")),
        parameters: [
          headerParam(
            "X-Captcha-Response",
            { type: "string" },
            "Turnstile token when enabled by account config.",
          ),
        ],
      },
    ),
  },
  "/api/v1/me/preferences": {
    get: operation(
      "Read signed-in preferences",
      { 200: json(ref("PreferencesResponse")), 401: error() },
      {
        operationId: "getPreferences",
        tags: ["Community"],
        security: authSecurity,
      },
    ),
    put: operation(
      "Write signed-in preferences",
      {
        200: json(ref("PreferencesResponse")),
        401: error(),
        403: error(),
        422: error(),
      },
      {
        operationId: "putPreferences",
        tags: ["Community"],
        security: authSecurity,
        requestBody: body(ref("PreferencesPatch")),
      },
    ),
  },
  "/api/v1/account/profile": {
    get: operation(
      "Read the signed-in profile",
      { 200: json(ref("ProfileResponse")), 401: error() },
      {
        operationId: "getProfile",
        tags: ["Community"],
        security: authSecurity,
      },
    ),
    patch: operation(
      "Update profile fields",
      {
        200: json(ref("ProfileResponse")),
        202: json(ref("ProfileResponse")),
        401: error(),
        409: error(),
        422: error(),
      },
      {
        operationId: "patchProfile",
        tags: ["Community"],
        security: authSecurity,
        requestBody: body(ref("ProfilePatch")),
      },
    ),
    delete: operation(
      "Delete the signed-in account",
      { 204: noContent(), 401: error(), 409: error(), 422: error() },
      {
        operationId: "deleteProfile",
        tags: ["Community"],
        security: authSecurity,
        requestBody: body(ref("DeleteProfileRequest")),
      },
    ),
  },
  "/api/v1/account/avatar": {
    put: operation(
      "Set a moderated avatar",
      { 202: json(ref("PendingAvatarResponse")), 401: error(), 415: error() },
      {
        operationId: "putAvatar",
        tags: ["Community"],
        security: authSecurity,
        requestBody: {
          required: true,
          content: {
            "image/jpeg": { schema: { type: "string", format: "binary" } },
            "image/png": { schema: { type: "string", format: "binary" } },
            "image/webp": { schema: { type: "string", format: "binary" } },
          },
        },
      },
    ),
    delete: operation(
      "Delete the signed-in avatar",
      { 204: noContent(), 401: error() },
      {
        operationId: "deleteAvatar",
        tags: ["Community"],
        security: authSecurity,
      },
    ),
  },
  "/api/v1/account/avatar/{userId}": readPath(
    [pathParam("userId", "Opaque account identifier from an avatar URL.")],
    "Read a ready avatar",
    {
      200: binary("Avatar bytes.", {
        ETag: rangeHeaders.ETag,
        "Content-Length": rangeHeaders["Content-Length"],
      }),
      304: noContent("Avatar has not changed.", { ETag: rangeHeaders.ETag }),
      404: error(),
    },
    { operationId: "getAvatar", tags: ["Community"] },
  ),
  "/api/v1/servers/{server}/release": resourcePath(
    "release",
    "Read the current or pinned release manifest",
    {
      operationId: "getRelease",
      parameters: [
        releaseQuery,
        query(
          "projection",
          { type: "string", enum: ["identity"] },
          "Use identity for the compact release descriptor.",
        ),
      ],
      responses: withHeaders(
        { 200: json(ref("ReleaseResponse")), 404: error(), 503: error() },
        releaseHeaders,
      ),
    },
  ),
  "/api/v1/servers/{server}/ui-marks": resourcePath(
    "ui-marks",
    "Read the release UI mark mapping",
    {
      operationId: "getUiMarks",
      parameters: [releaseQuery],
      responses: withHeaders(
        ok(
          { type: "object", additionalProperties: { type: "string" } },
          "UI mark name to release asset path.",
        ),
        releaseHeaders,
      ),
    },
  ),
  "/api/v1/servers/{server}/sources/tree": resourcePath(
    "sources-tree",
    "Read the release source tree",
    {
      operationId: "getSourceTree",
      parameters: [releaseQuery],
      responses: withHeaders(ok(ref("SourceTreeDocument")), releaseHeaders),
    },
  ),
  "/api/v1/servers/{server}/sources/{sourcePath}": resourcePath(
    "source-record",
    "Read one published source DTO",
    {
      parameters: [
        pathParam(
          "sourcePath",
          "Encoded path beginning with Assets/ or Packages/; preserve path separators.",
        ),
        releaseQuery,
      ],
      responses: withHeaders(
        { 200: json(ref("SourceRecord")), 404: error() },
        releaseHeaders,
      ),
    },
  ),
  "/api/v1/servers/{server}/catalog": resourcePath(
    "catalog-manifest",
    "Read the catalog storage manifest",
    {
      operationId: "getCatalogManifest",
      parameters: [releaseQuery],
      responses: withHeaders(ok(ref("CatalogManifest")), releaseHeaders),
    },
  ),
  "/api/v1/servers/{server}/catalog/summary": resourcePath(
    "catalog-summary",
    "Read the catalog summary",
    {
      operationId: "getCatalogSummary",
      parameters: [releaseQuery],
      responses: withHeaders(ok(ref("CatalogSummary")), releaseHeaders),
    },
  ),
  "/api/v1/servers/{server}/{resource}": resourcePath(
    "catalog-resource",
    "Read a resource index or batch",
    {
      parameters: [
        pathParam(
          "resource",
          "Resource name declared in the catalog manifest.",
        ),
        releaseQuery,
        query(
          "id",
          { type: "string", pattern: "^[A-Za-z0-9][A-Za-z0-9._:~-]{0,255}$" },
          "Repeat for an entity batch.",
        ),
      ],
      responses: withHeaders(
        {
          200: json(ref("CatalogResourceIndexOrBatch")),
          400: error(),
          404: error(),
          502: error(),
        },
        releaseHeaders,
      ),
    },
  ),
  "/api/v1/servers/{server}/{resource}/{id}": resourcePath(
    "catalog-entity",
    "Read one catalog entity",
    {
      parameters: [
        pathParam(
          "resource",
          "Resource name declared in the catalog manifest.",
        ),
        pathParam("id", "Entity key returned by the resource index."),
        releaseQuery,
      ],
      responses: withHeaders(
        { 200: json(ref("CatalogEntity")), 404: error() },
        releaseHeaders,
      ),
    },
  ),
  "/api/v1/servers/{server}/{resource}/views/{view}": resourcePath(
    "catalog-view",
    "Read a view index or batch",
    {
      parameters: [
        pathParam(
          "resource",
          "Resource name declared in the catalog manifest.",
        ),
        pathParam("view", "View name declared in the resource manifest."),
        releaseQuery,
        query(
          "id",
          { type: "string", pattern: "^[A-Za-z0-9][A-Za-z0-9._:~-]{0,255}$" },
          "Repeat for a view entity batch.",
        ),
      ],
      responses: withHeaders(
        {
          200: json(ref("CatalogViewDocumentOrBatch")),
          400: error(),
          404: error(),
          502: error(),
        },
        releaseHeaders,
      ),
    },
  ),
  "/api/v1/servers/{server}/{resource}/views/{view}/{id}": resourcePath(
    "catalog-view-entity",
    "Read one view entity",
    {
      parameters: [
        pathParam(
          "resource",
          "Resource name declared in the catalog manifest.",
        ),
        pathParam("view", "View name declared in the resource manifest."),
        pathParam("id", "View entity key returned by the view index."),
        releaseQuery,
      ],
      responses: withHeaders(
        { 200: json(ref("CatalogEntity")), 404: error() },
        releaseHeaders,
      ),
    },
  ),
  "/api/v1/servers/{server}/{resource}/relations/{relation}/{key}":
    resourcePath("catalog-relation", "Read one catalog relation", {
      parameters: [
        pathParam(
          "resource",
          "Resource name declared in the resource manifest.",
        ),
        pathParam(
          "relation",
          "Relation name declared in the resource manifest.",
        ),
        pathParam("key", "Relation key returned by the relation index."),
        releaseQuery,
      ],
      responses: withHeaders(
        { 200: json(ref("CatalogRelationResponse")), 404: error() },
        releaseHeaders,
      ),
    }),
};

Object.assign(paths, {
  "/api/v1/{resource}": latestResourcePath(
    "resource-index",
    "Read the current resource index or an entity batch",
    {
      operationId: "getLatestResource",
      parameters: [
        query(
          "id",
          { type: "string", pattern: "^[A-Za-z0-9][A-Za-z0-9._:~-]{0,255}$" },
          "Repeat for an entity batch.",
        ),
      ],
      responses: {
        200: json(ref("CatalogResourceIndexOrBatch")),
        400: error(),
        404: error(),
        502: error(),
      },
    },
  ),
  "/api/v1/{resource}/{id}": latestResourcePath(
    "resource-entity",
    "Read one current resource entity",
    {
      operationId: "getLatestEntity",
      parameters: [pathParam("id", "Entity key returned by the resource index.")],
      responses: { 200: json(ref("CatalogEntity")), 404: error() },
    },
  ),
  "/api/v1/{resource}/views/{view}": latestResourcePath(
    "resource-view",
    "Read a current resource view or view batch",
    {
      operationId: "getLatestView",
      parameters: [
        pathParam("view", "View name declared in the resource manifest."),
        query(
          "id",
          { type: "string", pattern: "^[A-Za-z0-9][A-Za-z0-9._:~-]{0,255}$" },
          "Repeat for a view entity batch.",
        ),
      ],
      responses: {
        200: json(ref("CatalogViewDocumentOrBatch")),
        400: error(),
        404: error(),
        502: error(),
      },
    },
  ),
  "/api/v1/{resource}/views/{view}/{id}": latestResourcePath(
    "resource-view-entity",
    "Read one current view entity",
    {
      operationId: "getLatestViewEntity",
      parameters: [
        pathParam("view", "View name declared in the resource manifest."),
        pathParam("id", "View entity key returned by the view index."),
      ],
      responses: { 200: json(ref("CatalogEntity")), 404: error() },
    },
  ),
  "/api/v1/{resource}/relations/{relation}/{key}": latestResourcePath(
    "resource-relation",
    "Read one current resource relation",
    {
      operationId: "getLatestRelation",
      parameters: [
        pathParam("relation", "Relation name declared in the resource manifest."),
        pathParam("key", "Relation key returned by the relation index."),
      ],
      responses: { 200: json(ref("CatalogRelationResponse")), 404: error() },
    },
  ),
});

for (const tree of ["assets", "runtime", "objects"])
  paths[`/${tree}/{server}/{path}`] = resourcePath(
    `${tree}-media`,
    `Read a release ${tree} object`,
    {
      parameters: [
        pathParam("path", "Encoded release path from the release index."),
      ],
      responses: binaryResponses("Release object bytes."),
    },
  );
paths["/artifacts/{server}/{sourceId}/android/bundles/{filename}"] = readPath(
  [
    pathParam("server", "Active resource-server slug."),
    pathParam("sourceId", "Source ID from release metadata."),
    pathParam(
      "filename",
      "Unity bundle original filename from the source descriptor.",
    ),
  ],
  "Read a content-addressed Android bundle",
  binaryResponses("Unity bundle bytes.", "Bundle not found."),
  { operationId: "getAndroidBundle", tags: ["Resource servers"] },
);
paths["/game-client/{server}/manifest.json"] = resourcePath(
  "game-client-manifest",
  "Read the current game-client manifest",
  {
    operationId: "getGameClientManifest",
    responses: withHeaders(
      {
        200: json(ref("GameClientManifest")),
        206: {
          description: "Partial byte range of the manifest representation.",
          headers: rangeHeaders,
        },
        404: text("Manifest not found."),
        416: {
          description: "The requested byte range is not satisfiable.",
          headers: rangeHeaders,
        },
        503: text("Release unavailable."),
      },
      releaseHeaders,
    ),
  },
);
paths["/game-client/{server}/master/{filename}"] = resourcePath(
  "game-client-master",
  "Read a published Master file",
  {
    parameters: [
      pathParam(
        "filename",
        "MasterDataSystemVersion.txt or a manifest-listed Master*.bin filename.",
      ),
    ],
    responses: withHeaders(
      binaryResponses("Published Master file bytes."),
      releaseHeaders,
    ),
  },
);
paths["/game-client/{server}/asset/{platform}/{filename}"] = resourcePath(
  "game-client-addressable",
  "Read one Addressables object",
  {
    parameters: [
      pathParam("platform", "Must equal the manifest platform."),
      pathParam("filename", "Manifest- or index-listed filename."),
    ],
    responses: withHeaders(
      binaryResponses("Addressables object bytes."),
      releaseHeaders,
    ),
  },
);
paths["/api/v1/garupa/playlists"] = {
  get: operation(
    "Read the current Garupa playlist projection",
    ok(ref("GarupaPlaylistProjection")),
    { operationId: "getGarupaPlaylists", tags: ["Provider APIs"] },
  ),
};

const sonolusRoutes = [
  ["/sonolus/info", "Read Sonolus server info"],
  ["/sonolus/levels/info", "Read Sonolus level info"],
  ["/sonolus/levels/list", "List Sonolus levels"],
  ["/sonolus/levels/{levelName}", "Read one Sonolus level"],
  [
    "/sonolus/levels/{levelName}/data/{sha1}",
    "Read one Sonolus level data object",
  ],
  ["/sonolus/playlists/info", "Read Sonolus playlist info"],
  ["/sonolus/playlists/list", "List Sonolus playlists"],
  ["/sonolus/playlists/{playlistName}", "Read one Sonolus playlist"],
];
for (const [route, summary] of sonolusRoutes) {
  const parameters = [];
  if (route.includes("{levelName}"))
    parameters.push(
      pathParam(
        "levelName",
        "Exact name returned by a Sonolus level document.",
      ),
    );
  if (route.includes("{playlistName}"))
    parameters.push(
      pathParam(
        "playlistName",
        "Exact name returned by a Sonolus playlist document.",
      ),
    );
  if (route.includes("{sha1}"))
    parameters.push(
      pathParam(
        "sha1",
        "40-character lowercase SHA-1 from the level data descriptor.",
        { type: "string", pattern: "^[a-f0-9]{40}$" },
      ),
    );
  if (route.endsWith("/list"))
    parameters.push(
      query(
        "page",
        { type: "integer", minimum: 0, default: 0 },
        "Zero-based page number.",
      ),
      query("type", { type: "string", enum: ["random"] }, "Random projection."),
      query(
        "source",
        { type: "string", enum: ["bestdori"] },
        "Use the Bestdori chart source.",
      ),
    );
  if (route.endsWith("/info"))
    parameters.push(
      query("type", { type: "string", enum: ["random"] }, "Random projection."),
      query(
        "source",
        { type: "string", enum: ["bestdori"] },
        "Use the Bestdori chart source.",
      ),
    );
  paths[route] = readPath(
    parameters,
    summary,
    route.includes("/data/")
      ? {
          200: binary("Sonolus level data bytes.", {
            "Content-Length": rangeHeaders["Content-Length"],
            ETag: rangeHeaders.ETag,
          }),
          404: json(ref("SonolusError")),
          503: json(ref("SonolusError")),
        }
      : {
          200: json(ref("SonolusDocument")),
          404: json(ref("SonolusError")),
          503: json(ref("SonolusError")),
        },
    { operationId: route.replace(/[^A-Za-z0-9]+/g, "-"), tags: ["Sonolus"] },
  );
}

const bestdoriCollections = {
  bands: "BestdoriBandMap",
  songs: "BestdoriSongMap",
  "song-meta": "BestdoriSongMetaMap",
  characters: "BestdoriCharacterMap",
  cards: "BestdoriCardMap",
};
for (const [collection, schemaName] of Object.entries(bestdoriCollections))
  paths[`/api/v1/garupa/bestdori/{region}/${collection}`] = readPath(
    [pathParam("region", "Bestdori provider region: jp, en, tw, cn, or kr.")],
    `Read Bestdori ${collection}`,
    ok(ref(schemaName)),
    {
      operationId: `getBestdori${collection.replace(/(^|-)(.)/g, (_, __, c) => c.toUpperCase())}`,
      tags: ["Provider APIs"],
    },
  );
paths["/api/v1/garupa/bestdori/{region}/editor-assets"] = readPath(
  [pathParam("region", "Bestdori provider region.")],
  "Read Bestdori editor asset tree",
  ok(ref("BestdoriEditorAssetResponse")),
  { operationId: "getBestdoriEditorAssets", tags: ["Provider APIs"] },
);
paths["/api/v1/garupa/bestdori/{region}/editor-assets/{bundlePath}"] = readPath(
  [
    pathParam("region", "Bestdori provider region."),
    pathParam("bundlePath", "Safe provider editor asset path."),
  ],
  "Read a Bestdori editor asset file list",
  ok(ref("BestdoriEditorAssetResponse")),
  { operationId: "getBestdoriEditorAssetBundle", tags: ["Provider APIs"] },
);
paths["/api/v1/garupa/bestdori/{region}/live2d"] = readPath(
  [
    pathParam("region", "Bestdori provider region."),
    query(
      "id",
      { type: "string", pattern: "^[A-Za-z0-9_-]+$" },
      "Repeat for an ID; capped at 64 unique IDs.",
    ),
    query(
      "server",
      { type: "string", enum: ["jp", "en", "tw", "cn", "kr"] },
      "Optional source region.",
    ),
  ],
  "Resolve Bestdori Live2D entries",
  ok(ref("BestdoriLive2dResponse")),
  { operationId: "getBestdoriLive2d", tags: ["Provider APIs"] },
);
paths["/api/v1/garupa/bestdori/{region}/stories/{storyId}"] = readPath(
  [
    pathParam("region", "Bestdori provider region."),
    pathParam("storyId", "Collection selector or canonical story ID/filename."),
  ],
  "Read a Bestdori story collection or story",
  ok(ref("BestdoriStoryDocument")),
  { operationId: "getBestdoriStory", tags: ["Provider APIs"] },
);
paths["/api/v1/garupa/bestdori/{region}/songs/{musicId}"] = readPath(
  [
    pathParam("region", "Bestdori provider region."),
    pathParam("musicId", "Decimal provider song ID.", {
      type: "string",
      pattern: "^[0-9]+$",
    }),
  ],
  "Read one Bestdori song",
  ok(ref("BestdoriSong")),
  { operationId: "getBestdoriSong", tags: ["Provider APIs"] },
);
paths["/api/v1/garupa/bestdori/{region}/song-meta/{musicId}"] = readPath(
  [
    pathParam("region", "Bestdori provider region."),
    pathParam("musicId", "Decimal provider song ID.", {
      type: "string",
      pattern: "^[0-9]+$",
    }),
  ],
  "Read one Bestdori song metadata record",
  ok(ref("BestdoriSongMeta")),
  { operationId: "getBestdoriSongMetaRecord", tags: ["Provider APIs"] },
);
paths["/api/v1/garupa/bestdori/{region}/cards/{cardId}"] = readPath(
  [
    pathParam("region", "Bestdori provider region."),
    pathParam("cardId", "Decimal provider card ID.", {
      type: "string",
      pattern: "^[0-9]+$",
    }),
  ],
  "Read one Bestdori card",
  ok(ref("BestdoriCard")),
  { operationId: "getBestdoriCard", tags: ["Provider APIs"] },
);
paths["/api/v1/garupa/bestdori/{region}/charts/{musicId}/{difficulty}"] =
  readPath(
    [
      pathParam("region", "Bestdori provider region."),
      pathParam("musicId", "Decimal provider song ID.", {
        type: "string",
        pattern: "^[0-9]+$",
      }),
      pathParam("difficulty", "Chart difficulty.", {
        type: "string",
        enum: ["easy", "normal", "hard", "expert", "special"],
      }),
    ],
    "Read one Bestdori chart in SS format",
    { 200: text("SS chart text."), 502: error() },
    { operationId: "getBestdoriChart", tags: ["Provider APIs"] },
  );
for (const [kind, pathTail, contentType] of [
  ["jacket", "jacket/{package}/{image}", "image/png"],
  ["jacketThumb", "jacket-thumb/{package}/{image}", "image/png"],
  ["sound", "sound/{soundId}", "audio/mpeg"],
  ["musicVideo", "mv/{filename}", "video/mp4"],
  ["stageChallenge", "stage-challenge/{assetId}", "image/png"],
]) {
  const parameters = [pathParam("region", "Bestdori provider region.")];
  for (const segment of pathTail
    .split("/")
    .filter((part) => part.startsWith("{")))
    parameters.push(
      pathParam(segment.slice(1, -1), "Provider media path segment."),
    );
  paths[`/api/v1/garupa/bestdori/{region}/media/${pathTail}`] = readPath(
    parameters,
    `Read Bestdori ${kind} media`,
    {
      200: binary(`Media bytes (${contentType}).`),
      206: binary(`Partial media bytes (${contentType}).`),
      404: error(),
      502: error(),
      416: {
        description: "The requested byte range is not satisfiable.",
        headers: rangeHeaders,
      },
    },
    {
      operationId: `getBestdori${kind[0].toUpperCase()}${kind.slice(1)}`,
      tags: ["Provider APIs"],
    },
  );
}
paths["/api/v1/garupa/bestdori/{region}/raw/{providerPath}"] = readPath(
  [
    pathParam("region", "Bestdori provider region."),
    pathParam(
      "providerPath",
      "Safe provider path; traversal and encoded NULs are rejected.",
    ),
  ],
  "Read a raw Bestdori provider asset",
  {
    200: binary("Provider asset bytes."),
    206: binary("Partial provider asset bytes."),
    404: error(),
    502: error(),
    416: {
      description: "The requested byte range is not satisfiable.",
      headers: rangeHeaders,
    },
  },
  { operationId: "getBestdoriRawAsset", tags: ["Provider APIs"] },
);

const community = "/api/v1/community";
const uuid = (name, description) =>
  pathParam(name, description, { type: "string", format: "uuid" });
paths[`${community}/posts`] = {
  get: operation("List community posts", ok(ref("PostListResponse")), {
    operationId: "listCommunityPosts",
    tags: ["Community"],
    parameters: [
      query(
        "limit",
        { type: "integer", minimum: 1, maximum: 50, default: 20 },
        "Page size.",
      ),
      query("cursor", { type: "string" }, "Opaque cursor."),
      query(
        "scope",
        {
          type: "string",
          enum: [
            "all",
            "latest",
            "recommended",
            "following",
            "mine",
            "bookmarked",
          ],
          default: "all",
        },
        "Feed scope.",
      ),
      query(
        "state",
        {
          type: "string",
          enum: ["active", "archived", "all"],
          default: "active",
        },
        "Post state.",
      ),
      query("q", { type: "string", maxLength: 100 }, "Title/body search."),
      query("tag", { type: "string" }, "Normalized tag."),
      query(
        "seed",
        { type: "integer", minimum: 0, maximum: 2147483647 },
        "Recommendation seed.",
      ),
      query(
        "refresh",
        { type: "string", enum: ["1"] },
        "Start a fresh recommendation feed.",
      ),
    ],
  }),
  post: operation(
    "Create a community post",
    {
      ...created(ref("PostMutationResponse")),
      ...accepted(ref("PostMutationResponse")),
      401: error(),
      403: error(),
      409: error(),
      422: error(),
    },
    {
      operationId: "createCommunityPost",
      tags: ["Community"],
      security: authSecurity,
      requestBody: body(ref("PostCreateRequest")),
    },
  ),
};
paths[`${community}/posts/{postId}`] = {
  parameters: [uuid("postId", "Post UUID returned by the service.")],
  get: operation(
    "Read one community post",
    {
      200: json({ oneOf: [ref("PostResponse"), ref("PostCommentsResponse")] }),
      404: error(),
    },
    {
      operationId: "getCommunityPost",
      tags: ["Community"],
      parameters: [
        query(
          "includeComments",
          { type: "string", enum: ["false"] },
          "Exclude comments.",
        ),
        query(
          "commentsOnly",
          { type: "string", enum: ["true"] },
          "Return only comments.",
        ),
        query("commentsCursor", { type: "string" }, "Opaque comment cursor."),
        query(
          "commentsSort",
          { type: "string", enum: ["hot", "latest"] },
          "Comment order.",
        ),
        query(
          "commentId",
          { type: "string", format: "uuid" },
          "Focus a visible comment.",
        ),
      ],
    },
  ),
  patch: operation(
    "Edit a community post",
    {
      200: json(ref("PostMutationResponse")),
      202: json(ref("PostMutationResponse")),
      401: error(),
      403: error(),
      409: error(),
      422: error(),
    },
    {
      operationId: "patchCommunityPost",
      tags: ["Community"],
      security: authSecurity,
      requestBody: body(ref("PostPatchRequest")),
    },
  ),
  delete: operation(
    "Delete a community post",
    {
      204: noContent(),
      401: error(),
      403: error(),
      409: error(),
      422: error(),
    },
    {
      operationId: "deleteCommunityPost",
      tags: ["Community"],
      security: authSecurity,
      requestBody: body(ref("VersionRequest")),
    },
  ),
};
for (const [suffix, method, summary, requestSchema, responseSchema] of [
  [
    "comments",
    "post",
    "Create a comment",
    "CommentCreateRequest",
    "CommentMutationResponse",
  ],
  [
    "reaction",
    "put",
    "Toggle a post reaction",
    "ActiveRequest",
    "ReactionResponse",
  ],
  [
    "bookmark",
    "put",
    "Toggle a post bookmark",
    "ActiveRequest",
    "ActiveResponse",
  ],
  ["pin", "put", "Pin or unpin a post", "PinRequest", "PostMutationResponse"],
  [
    "archive",
    "post",
    "Archive a post",
    "VersionRequest",
    "PostMutationResponse",
  ],
  [
    "restore",
    "post",
    "Restore a post",
    "VersionRequest",
    "PostMutationResponse",
  ],
])
  paths[`${community}/posts/{postId}/${suffix}`] = {
    parameters: [uuid("postId", "Post UUID returned by the service.")],
    [method]: operation(
      summary,
      {
        200: json(ref(responseSchema)),
        201: json(ref(responseSchema)),
        202: json(ref(responseSchema)),
        401: error(),
        403: error(),
        409: error(),
        422: error(),
      },
      {
        operationId: `${method}${suffix.replace(/(^|-)(.)/g, (_, __, c) => c.toUpperCase())}CommunityPost`,
        tags: ["Community"],
        security: authSecurity,
        requestBody: body(ref(requestSchema)),
      },
    ),
  };
paths[`${community}/notifications`] = {
  get: operation("List notifications", ok(ref("NotificationsResponse")), {
    operationId: "listNotifications",
    tags: ["Community"],
    security: authSecurity,
    parameters: [
      query(
        "limit",
        { type: "integer", minimum: 1, maximum: 50, default: 20 },
        "Page size.",
      ),
      query("cursor", { type: "string" }, "Opaque cursor."),
      query(
        "unread",
        { type: "string", enum: ["true", "false"] },
        "Filter read state.",
      ),
      query(
        "countOnly",
        { type: "string", enum: ["true"] },
        "Return only unreadCount.",
      ),
    ],
  }),
};
paths[`${community}/notifications/read-all`] = {
  put: operation(
    "Mark all notifications read",
    { 200: json(ref("MarkAllReadResponse")), 401: error() },
    {
      operationId: "markAllNotificationsRead",
      tags: ["Community"],
      security: authSecurity,
    },
  ),
};
paths[`${community}/notifications/{notificationId}/read`] = {
  parameters: [
    uuid("notificationId", "Notification UUID returned by the service."),
  ],
  put: operation(
    "Mark one notification read",
    { 200: json(ref("MarkReadResponse")), 401: error(), 404: error() },
    {
      operationId: "markNotificationRead",
      tags: ["Community"],
      security: authSecurity,
    },
  ),
};
paths[`${community}/tags`] = {
  get: operation("List visible tags", ok(ref("TagListResponse")), {
    operationId: "listTags",
    tags: ["Community"],
    parameters: [
      query(
        "limit",
        { type: "integer", minimum: 1, maximum: 100, default: 30 },
        "Page size.",
      ),
      query("cursor", { type: "string" }, "Opaque cursor."),
      query("q", { type: "string", maxLength: 64 }, "Tag search."),
    ],
  }),
};
paths[`${community}/tags/preferences`] = {
  get: operation(
    "List signed-in tag preferences",
    ok(ref("TagPreferencesResponse")),
    {
      operationId: "listTagPreferences",
      tags: ["Community"],
      security: authSecurity,
      parameters: [
        query(
          "limit",
          { type: "integer", minimum: 1, maximum: 100, default: 30 },
          "Page size.",
        ),
        query("cursor", { type: "string" }, "Opaque cursor."),
      ],
    },
  ),
};
paths[`${community}/tags/{tag}/preference`] = {
  parameters: [pathParam("tag", "Normalized tag name or alias.")],
  put: operation(
    "Set a tag preference",
    {
      200: json(ref("TagPreferenceMutationResponse")),
      401: error(),
      404: error(),
      422: error(),
    },
    {
      operationId: "putTagPreference",
      tags: ["Community"],
      security: authSecurity,
      requestBody: body(ref("TagPreferenceRequest")),
    },
  ),
};
for (const relation of ["follow", "block", "mute"])
  paths[`${community}/users/{uid}/${relation}`] = {
    parameters: [
      pathParam("uid", "Public numeric UID returned by a profile.", {
        type: "integer",
        minimum: 1,
      }),
    ],
    put: operation(
      `Set a user ${relation} relationship`,
      {
        200: json(ref("UserRelationshipResponse")),
        401: error(),
        403: error(),
        404: error(),
        409: error(),
        422: error(),
      },
      {
        operationId: `putUser${relation[0].toUpperCase()}${relation.slice(1)}`,
        tags: ["Community"],
        security: authSecurity,
        requestBody: body(ref("ActiveRequest")),
      },
    ),
  };
paths[`${community}/posts/{postId}/feedback`] = {
  parameters: [uuid("postId", "Post UUID returned by the service.")],
  put: operation(
    "Set feed feedback",
    {
      200: json(ref("FeedbackResponse")),
      401: error(),
      404: error(),
      422: error(),
    },
    {
      operationId: "putPostFeedback",
      tags: ["Community"],
      security: authSecurity,
      requestBody: body(ref("FeedbackRequest")),
    },
  ),
};
paths[`${community}/me/post-feedback`] = {
  delete: operation(
    "Clear feed feedback",
    { 200: json(ref("ClearedFeedbackResponse")), 401: error() },
    {
      operationId: "clearPostFeedback",
      tags: ["Community"],
      security: authSecurity,
    },
  ),
};
paths[`${community}/reports`] = {
  post: operation(
    "Report community content",
    {
      200: json(ref("ReportResponse")),
      201: json(ref("ReportResponse")),
      401: error(),
      404: error(),
      422: error(),
      429: error(),
    },
    {
      operationId: "createReport",
      tags: ["Community"],
      security: authSecurity,
      requestBody: body(ref("ReportRequest")),
    },
  ),
};
paths[`${community}/comments/{commentId}`] = {
  parameters: [uuid("commentId", "Comment UUID returned by the service.")],
  patch: operation(
    "Edit a comment",
    {
      200: json(ref("CommentMutationResponse")),
      202: json(ref("CommentMutationResponse")),
      401: error(),
      403: error(),
      409: error(),
      422: error(),
    },
    {
      operationId: "patchComment",
      tags: ["Community"],
      security: authSecurity,
      requestBody: body(ref("CommentPatchRequest")),
    },
  ),
  delete: operation(
    "Delete a comment",
    {
      200: json(ref("DeletedCommentResponse")),
      401: error(),
      403: error(),
      409: error(),
      422: error(),
    },
    {
      operationId: "deleteComment",
      tags: ["Community"],
      security: authSecurity,
      requestBody: body(ref("VersionRequest")),
    },
  ),
};
paths[`${community}/comments/{commentId}/reaction`] = {
  parameters: [uuid("commentId", "Comment UUID returned by the service.")],
  put: operation(
    "Toggle a comment reaction",
    {
      200: json(ref("ReactionResponse")),
      401: error(),
      404: error(),
      422: error(),
    },
    {
      operationId: "putCommentReaction",
      tags: ["Community"],
      security: authSecurity,
      requestBody: body(ref("ActiveRequest")),
    },
  ),
};
paths[`${community}/me/comments`] = {
  get: operation(
    "List the signed-in user's comments",
    ok(ref("CommentActivityResponse")),
    {
      operationId: "listOwnComments",
      tags: ["Community"],
      security: authSecurity,
      parameters: [
        query(
          "limit",
          { type: "integer", minimum: 1, maximum: 50, default: 20 },
          "Page size.",
        ),
        query("cursor", { type: "string" }, "Opaque cursor."),
      ],
    },
  ),
};
paths["/api/v1/community/users/{uid}"] = {
  parameters: [
    pathParam("uid", "Public numeric UID returned by a profile.", {
      type: "integer",
      minimum: 1,
    }),
  ],
  get: operation(
    "Read a public community profile",
    { 200: json(ref("PublicProfileResponse")), 404: error() },
    {
      operationId: "getPublicProfile",
      tags: ["Community"],
      parameters: [
        query(
          "limit",
          { type: "integer", minimum: 1, maximum: 50, default: 24 },
          "Post page size.",
        ),
        query("cursor", { type: "string" }, "Opaque post cursor."),
      ],
    },
  ),
};
paths[`${community}/uploads/policy`] = {
  get: operation("Read upload limits", ok(ref("UploadPolicyResponse")), {
    operationId: "getUploadPolicy",
    tags: ["Community"],
  }),
};
paths[`${community}/uploads/intents`] = {
  post: operation(
    "Create an upload intent",
    {
      201: json(ref("AttachmentResponse")),
      409: error(),
      413: error(),
      415: error(),
      422: error(),
    },
    {
      operationId: "createUploadIntent",
      tags: ["Community"],
      security: authSecurity,
      parameters: [
        headerParam(
          "Idempotency-Key",
          { type: "string", minLength: 16, maxLength: 128 },
          "Stable key for retrying the same upload intent.",
          true,
        ),
      ],
      requestBody: body(ref("UploadIntentRequest")),
    },
  ),
};
paths[`${community}/uploads/{attachmentId}/content`] = {
  parameters: [
    uuid("attachmentId", "Attachment UUID returned by an upload intent."),
  ],
  put: operation(
    "Upload one direct object",
    {
      200: json(ref("AttachmentResponse")),
      202: json(ref("AttachmentResponse")),
      400: error(),
      404: error(),
      409: error(),
      413: error(),
      415: error(),
    },
    {
      operationId: "putUploadContent",
      tags: ["Community"],
      security: authSecurity,
      requestBody: {
        required: true,
        content: {
          "application/octet-stream": {
            schema: { type: "string", format: "binary" },
          },
        },
      },
    },
  ),
};
paths[`${community}/uploads/{attachmentId}/parts/{partNumber}`] = {
  parameters: [
    uuid("attachmentId", "Attachment UUID returned by an upload intent."),
    pathParam("partNumber", "1-based multipart part number.", {
      type: "integer",
      minimum: 1,
    }),
  ],
  put: operation(
    "Upload one multipart part",
    {
      200: json(ref("UploadPartResponse")),
      404: error(),
      409: error(),
      415: error(),
      422: error(),
    },
    {
      operationId: "putUploadPart",
      tags: ["Community"],
      security: authSecurity,
      requestBody: {
        required: true,
        content: {
          "application/octet-stream": {
            schema: { type: "string", format: "binary" },
          },
        },
      },
    },
  ),
};
paths[`${community}/uploads/{attachmentId}/complete`] = {
  parameters: [
    uuid("attachmentId", "Attachment UUID returned by an upload intent."),
  ],
  post: operation(
    "Complete a multipart upload",
    {
      202: json(ref("UploadCompletionResponse")),
      404: error(),
      409: error(),
      415: error(),
      422: error(),
    },
    {
      operationId: "completeUpload",
      tags: ["Community"],
      security: authSecurity,
      requestBody: body(ref("MultipartCompleteRequest")),
    },
  ),
};
paths[`${community}/uploads/{attachmentId}/multipart`] = {
  parameters: [
    uuid("attachmentId", "Attachment UUID returned by an upload intent."),
  ],
  delete: operation(
    "Cancel a multipart upload",
    {
      200: json(ref("AttachmentNullableResponse")),
      404: error(),
      409: error(),
    },
    {
      operationId: "cancelUpload",
      tags: ["Community"],
      security: authSecurity,
    },
  ),
};
paths[`${community}/attachments/{attachmentId}`] = {
  parameters: [
    uuid("attachmentId", "Attachment UUID returned by an upload intent."),
  ],
  get: operation(
    "Read attachment metadata",
    ok(ref("AttachmentMetadataResponse")),
    {
      operationId: "getAttachment",
      tags: ["Community"],
      security: authSecurity,
    },
  ),
  delete: operation(
    "Delete an attachment",
    {
      200: json(ref("AttachmentNullableResponse")),
      404: error(),
      409: error(),
    },
    {
      operationId: "deleteAttachment",
      tags: ["Community"],
      security: authSecurity,
    },
  ),
};
paths[`${community}/attachments/{attachmentId}/content`] = {
  parameters: [
    uuid("attachmentId", "Attachment UUID returned by an upload intent."),
    query(
      "variant",
      { type: "string", enum: ["media", "poster", "thumb"] },
      "Processed media variant.",
    ),
  ],
  get: operation(
    "Read attachment content",
    {
      200: binary("Attachment bytes."),
      206: binary("Partial attachment bytes."),
      401: error(),
      403: error(),
      404: error(),
      416: {
        description: "The requested byte range is not satisfiable.",
        headers: rangeHeaders,
      },
    },
    { operationId: "getAttachmentContent", tags: ["Community"] },
  ),
};
paths[`${community}/posts/{postId}/attachments`] = {
  parameters: [uuid("postId", "Post UUID returned by the service.")],
  post: operation(
    "Attach ready media to a post",
    ok(ref("PostAttachmentsResponse")),
    {
      operationId: "linkPostAttachments",
      tags: ["Community"],
      security: authSecurity,
      requestBody: body(ref("PostAttachmentsRequest")),
    },
  ),
};
paths[`${community}/posts/{postId}/attachments/{attachmentId}`] = {
  parameters: [
    uuid("postId", "Post UUID returned by the service."),
    uuid("attachmentId", "Attachment UUID returned by an upload intent."),
  ],
  delete: operation(
    "Detach media from a post",
    { 200: json(ref("DetachedAttachmentResponse")), 404: error() },
    {
      operationId: "unlinkPostAttachment",
      tags: ["Community"],
      security: authSecurity,
    },
  ),
};

const authRoutes = {
  "/api/auth/get-session": "get",
  "/api/auth/sign-in/email": "post",
  "/api/auth/sign-in/social": "post",
  "/api/auth/sign-out": "post",
  "/api/auth/send-verification-email": "post",
  "/api/auth/verify-email": "get",
  "/api/auth/request-password-reset": "post",
  "/api/auth/reset-password": "post",
  "/api/auth/change-email": "post",
  "/api/auth/change-password": "post",
  "/api/auth/list-accounts": "get",
  "/api/auth/link-social": "post",
  "/api/auth/unlink-account": "post",
  "/api/auth/list-sessions": "get",
  "/api/auth/revoke-session": "post",
  "/api/auth/revoke-sessions": "post",
  "/api/auth/revoke-other-sessions": "post",
  "/api/auth/error": "get",
  "/api/auth/ok": "get",
};
const anonymousAuth = new Set([
  "/api/auth/get-session",
  "/api/auth/sign-in/email",
  "/api/auth/sign-in/social",
  "/api/auth/verify-email",
  "/api/auth/request-password-reset",
  "/api/auth/reset-password",
  "/api/auth/error",
  "/api/auth/ok",
]);
for (const [path, method] of Object.entries(authRoutes))
  paths[path] = {
    [method]: operation(
      `Better Auth ${method.toUpperCase()} ${path.slice("/api/auth/".length)}`,
      {
        200: json(ref("BetterAuthResponse")),
        400: error(),
        401: error(),
        503: error(),
      },
      {
        operationId: path.replace(/[^A-Za-z0-9]+/g, "-"),
        tags: ["Authentication"],
        ...(anonymousAuth.has(path) ? {} : { security: authSecurity }),
      },
    ),
  };
paths["/api/auth/get-session"].head = {
  ...paths["/api/auth/get-session"].get,
  operationId: "api-auth-get-session-head",
};
paths["/api/auth/reset-password/{token}"] = {
  parameters: [pathParam("token", "Opaque reset token from an email link.")],
  get: operation(
    "Open a password reset link",
    { 200: json(ref("BetterAuthResponse")), 400: error(), 404: error() },
    { operationId: "getAuthResetPasswordToken", tags: ["Authentication"] },
  ),
};
paths["/api/auth/callback/{provider}"] = {
  parameters: [
    pathParam("provider", "Configured social provider.", {
      type: "string",
      enum: ["discord", "github", "google", "twitter"],
    }),
  ],
  get: operation(
    "Complete a social callback",
    {
      302: { description: "Redirect to the configured callback URL." },
      400: error(),
      404: error(),
    },
    { operationId: "authCallbackGet", tags: ["Authentication"] },
  ),
  post: operation(
    "Complete a social callback",
    {
      302: { description: "Redirect to the configured callback URL." },
      400: error(),
      404: error(),
    },
    { operationId: "authCallbackPost", tags: ["Authentication"] },
  ),
};

const schemas = {
  Error: {
    type: "object",
    properties: {
      error: {
        type: "object",
        properties: {
          code: { type: "string" },
          message: { type: "string" },
          requestId: { type: "string" },
        },
        required: ["code", "message"],
        additionalProperties: true,
      },
    },
    required: ["error"],
    additionalProperties: false,
  },
  RequestIdHeader: { type: "string" },
  ReleaseRegistry: {
    type: "object",
    properties: {
      releases: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            displayName: { type: "string" },
            region: {
              type: "string",
              enum: ["global", "jp", "kr", "tw", "cn", "en"],
            },
          },
          required: ["id", "displayName", "region"],
          additionalProperties: false,
        },
      },
    },
    required: ["releases"],
    additionalProperties: false,
  },
  ReleaseManifest: {
    ...anyObject,
    description:
      "Release-specific manifest. Follow returned paths and identifiers.",
  },
  ReleaseIdentity: {
    type: "object",
    properties: {
      schema: { const: "haneoka-resource-release-identity-v1" },
      server: { type: "string" },
      releaseId: { type: "string", pattern: "^r-[a-f0-9]{20}$" },
      sourceId: { type: "string" },
    },
    required: ["schema", "server", "releaseId", "sourceId"],
    additionalProperties: false,
  },
  ReleaseResponse: {
    anyOf: [ref("ReleaseManifest"), ref("ReleaseIdentity")],
    description:
      "The default release manifest or the compact identity projection selected by projection=identity.",
  },
  AuthConfig: {
    type: "object",
    properties: {
      available: { type: "boolean" },
      emailDeliveryEnabled: { type: "boolean" },
      emailSignUpEnabled: { type: "boolean" },
      providers: {
        type: "array",
        items: {
          type: "string",
          enum: ["discord", "github", "google", "twitter"],
        },
      },
      turnstileSiteKey: { type: ["string", "null"] },
    },
    required: [
      "available",
      "emailDeliveryEnabled",
      "emailSignUpEnabled",
      "providers",
      "turnstileSiteKey",
    ],
    additionalProperties: false,
  },
  RegistrationRequest: {
    type: "object",
    properties: { email: { type: "string", format: "email" } },
    required: ["email"],
    additionalProperties: false,
  },
  CatalogShardStorage: {
    type: "object",
    properties: {
      algorithm: { const: "fnv1a32-mod-256" },
      count: { type: "integer", minimum: 0 },
      prefix: { type: "string" },
      shards: {
        type: "array",
        uniqueItems: true,
        items: { type: "string", pattern: "^[a-f0-9]{2}$" },
      },
    },
    required: ["algorithm", "count", "prefix", "shards"],
    additionalProperties: false,
  },
  CatalogRelationStorage: {
    type: "object",
    properties: {
      algorithm: { const: "fnv1a32-mod-256" },
      count: { type: "integer", minimum: 0 },
      entityCount: { type: "integer", minimum: 0 },
      prefix: { type: "string" },
      shards: {
        type: "array",
        uniqueItems: true,
        items: { type: "string", pattern: "^[a-f0-9]{2}$" },
      },
      valueMode: { type: "string", enum: ["ids", "records"] },
    },
    required: [
      "algorithm",
      "count",
      "entityCount",
      "prefix",
      "shards",
      "valueMode",
    ],
    additionalProperties: false,
  },
  CatalogViewStorage: {
    type: "object",
    properties: {
      count: { type: "integer", minimum: 0 },
      entities: ref("CatalogShardStorage"),
      index: { type: "string" },
      path: { type: "array", minItems: 1, items: { type: "string" } },
      shape: { type: "string", enum: ["array", "object"] },
    },
    required: ["count", "entities", "index", "path", "shape"],
    additionalProperties: false,
  },
  CatalogResource: {
    type: "object",
    properties: {
      count: { type: "integer", minimum: 0 },
      dependencies: {
        type: "array",
        uniqueItems: true,
        items: { type: "string" },
      },
      entities: { anyOf: [ref("CatalogShardStorage"), { type: "null" }] },
      index: { type: "string" },
      kind: { type: "string" },
      relations: {
        type: "object",
        additionalProperties: ref("CatalogRelationStorage"),
      },
      views: {
        type: "object",
        additionalProperties: ref("CatalogViewStorage"),
      },
    },
    required: ["count", "dependencies", "index", "kind"],
    additionalProperties: false,
  },
  CatalogManifest: {
    type: "object",
    properties: {
      schema: { const: "haneoka-catalog-storage-v2" },
      server: { type: "string" },
      sourceId: { type: "string" },
      summary: { type: "string" },
      partition: {
        type: "object",
        properties: {
          algorithm: { const: "fnv1a32-mod-256" },
          shards: { const: 256 },
        },
        required: ["algorithm", "shards"],
        additionalProperties: false,
      },
      resources: {
        type: "object",
        additionalProperties: ref("CatalogResource"),
      },
    },
    required: [
      "schema",
      "server",
      "sourceId",
      "summary",
      "partition",
      "resources",
    ],
    additionalProperties: false,
  },
  CatalogEntity: {
    ...anyObject,
    description:
      "Resource-defined catalog entity; do not assume a universal id/title shape.",
  },
  CatalogResourceIndex: {
    ...anyObject,
    description: "Resource-defined index document.",
  },
  CatalogViewDocument: {
    ...anyDocument,
    description: "View index document; the manifest declares its root shape.",
  },
  CatalogBatch: {
    type: "object",
    properties: {
      items: { type: "object", additionalProperties: ref("CatalogEntity") },
      missing: { type: "array", items: { type: "string" } },
    },
    required: ["items", "missing"],
    additionalProperties: false,
  },
  CatalogResourceIndexOrBatch: {
    anyOf: [ref("CatalogResourceIndex"), ref("CatalogBatch")],
  },
  CatalogViewDocumentOrBatch: {
    anyOf: [ref("CatalogViewDocument"), ref("CatalogBatch")],
  },
  CatalogRelationResponse: {
    anyOf: [
      { type: "object", additionalProperties: ref("CatalogEntity") },
      anyObject,
    ],
    description:
      "ids relations are entity maps; records relations are provider record objects.",
  },
  CatalogSummary: {
    ...anyDocument,
    description: "Release-defined catalog summary.",
  },
  SourceTreeDocument: {
    ...anyDocument,
    description: "Published source-tree document.",
  },
  SourceRecord: { ...anyObject, description: "Release-defined source DTO." },
  GameClientManifest: {
    type: "object",
    properties: {
      schema: { const: "haneoka-game-client-v1" },
      server: { type: "string" },
      sourceId: { type: "string" },
      master: {
        type: "object",
        properties: { systemVersion: { type: "string" } },
        required: ["systemVersion"],
        additionalProperties: true,
      },
      addressables: {
        type: "object",
        properties: {
          platform: { type: "string" },
          catalogFile: { type: "string" },
          catalogHashFile: { type: "string" },
          embeddedCatalogFile: { type: "string" },
          index: { type: "object", additionalProperties: true },
        },
        required: [
          "platform",
          "catalogFile",
          "catalogHashFile",
          "embeddedCatalogFile",
          "index",
        ],
        additionalProperties: true,
      },
    },
    required: ["schema", "server", "sourceId", "master", "addressables"],
    additionalProperties: true,
  },
  GarupaPlaylistProjection: { ...anyObject },
  SonolusDocument: { ...anyObject },
  SonolusError: {
    type: "object",
    properties: { message: { type: "string" } },
    required: ["message"],
    additionalProperties: true,
  },
  ActiveRequest: {
    type: "object",
    properties: { active: { type: "boolean" } },
    required: ["active"],
    additionalProperties: false,
  },
  ActiveResponse: {
    type: "object",
    properties: { active: { type: "boolean" } },
    required: ["active"],
    additionalProperties: false,
  },
  VersionRequest: {
    type: "object",
    properties: { version: { type: "integer", minimum: 1 } },
    required: ["version"],
    additionalProperties: false,
  },
  PinRequest: {
    type: "object",
    properties: {
      active: { type: "boolean" },
      version: { type: "integer", minimum: 1 },
    },
    required: ["active", "version"],
    additionalProperties: false,
  },
  PostCreateRequest: {
    type: "object",
    properties: {
      title: { type: "string", minLength: 1, maxLength: 120 },
      body: { type: "string", minLength: 1, maxLength: 20000 },
      visibility: {
        type: "string",
        enum: ["public", "protected", "private"],
        default: "public",
      },
      tags: { type: "array", maxItems: 10, items: { type: "string" } },
      attachmentIds: {
        type: "array",
        maxItems: 16,
        uniqueItems: true,
        items: { type: "string", format: "uuid" },
      },
    },
    required: ["body"],
  },
  PostPatchRequest: {
    type: "object",
    description:
      "Send the current body and version. Title, visibility, tags, and editReason are optional.",
    properties: {
      title: { type: "string", minLength: 1, maxLength: 120 },
      body: { type: "string", minLength: 1, maxLength: 20000 },
      visibility: { type: "string", enum: ["public", "protected", "private"] },
      tags: { type: "array", maxItems: 10, items: { type: "string" } },
      version: { type: "integer", minimum: 1 },
      editReason: { type: ["string", "null"], maxLength: 500 },
    },
    required: ["body", "version"],
  },
  CommentCreateRequest: {
    type: "object",
    properties: {
      body: { type: "string", minLength: 1, maxLength: 5000 },
      parentId: { type: ["string", "null"], format: "uuid" },
    },
    required: ["body"],
  },
  CommentPatchRequest: {
    type: "object",
    properties: {
      body: { type: "string", minLength: 1, maxLength: 5000 },
      version: { type: "integer", minimum: 1 },
      editReason: { type: ["string", "null"], maxLength: 500 },
    },
    required: ["body", "version"],
  },
  CommunityPostFields: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      title: { type: "string" },
      visibility: { type: "string", enum: ["public", "protected", "private"] },
      moderationStatus: {
        type: "string",
        enum: ["allow", "block", "pending", "review"],
      },
      state: { type: "string", enum: ["active", "archived"] },
      version: { type: "integer" },
      createdAt: { type: "integer" },
      updatedAt: { type: "integer" },
      lastEditedAt: { type: "integer" },
      commentCount: { type: "integer" },
      likeCount: { type: "integer" },
      pinnedAt: { type: ["integer", "null"] },
      archivedAt: { type: ["integer", "null"] },
      commentsLockedAt: { type: ["integer", "null"] },
      authorUid: { type: "integer" },
      authorName: { type: "string" },
      authorImage: { type: ["string", "null"] },
      avatarSeed: { type: "string" },
      device: {
        anyOf: [{ type: "null" }, { $ref: "#/components/schemas/Device" }],
      },
      ipLocation: {
        anyOf: [{ type: "null" }, { $ref: "#/components/schemas/IpLocation" }],
      },
      tags: { type: "array", items: { type: "string" } },
      attachments: { type: "array", items: ref("PostAttachment") },
    },
    required: [
      "id",
      "title",
      "visibility",
      "moderationStatus",
      "state",
      "version",
      "createdAt",
      "updatedAt",
      "lastEditedAt",
      "commentCount",
      "likeCount",
      "pinnedAt",
      "archivedAt",
      "commentsLockedAt",
      "authorUid",
      "authorName",
      "authorImage",
      "avatarSeed",
      "device",
      "ipLocation",
      "tags",
      "attachments",
    ],
    additionalProperties: true,
  },
  Post: {
    allOf: [
      ref("CommunityPostFields"),
      {
        type: "object",
        properties: { body: { type: "string" } },
        required: ["body"],
      },
    ],
  },
  PostListViewer: {
    type: "object",
    properties: {
      liked: { type: "boolean" },
      bookmarked: { type: "boolean" },
      canEdit: { type: "boolean" },
      canGiveFeedback: { type: "boolean" },
    },
    required: ["liked", "bookmarked", "canEdit", "canGiveFeedback"],
    additionalProperties: false,
  },
  PostListItem: {
    allOf: [
      ref("CommunityPostFields"),
      {
        type: "object",
        properties: {
          excerpt: { type: "string", maxLength: 500 },
          viewer: ref("PostListViewer"),
        },
        required: ["excerpt", "viewer"],
      },
    ],
  },
  PostViewer: {
    type: "object",
    properties: {
      liked: { type: "boolean" },
      bookmarked: { type: "boolean" },
      following: { type: "boolean" },
      canEdit: { type: "boolean" },
      canDelete: { type: "boolean" },
      canComment: { type: "boolean" },
    },
    required: ["liked", "bookmarked", "canEdit", "canDelete", "canComment"],
    additionalProperties: true,
  },
  Comment: {
    type: "object",
    additionalProperties: true,
    properties: {
      id: { type: "string", format: "uuid" },
      body: { type: "string" },
      moderationStatus: { type: "string" },
      parentId: { type: ["string", "null"], format: "uuid" },
      likeCount: { type: "integer" },
      version: { type: "integer" },
      createdAt: { type: "integer" },
      updatedAt: { type: "integer" },
      lastEditedAt: { type: "integer" },
      authorUid: { type: "integer" },
      authorName: { type: "string" },
      authorImage: { type: ["string", "null"] },
      avatarSeed: { type: "string" },
      viewer: { type: "object", additionalProperties: true },
    },
    required: [
      "id",
      "body",
      "moderationStatus",
      "parentId",
      "likeCount",
      "version",
      "createdAt",
      "updatedAt",
      "lastEditedAt",
      "authorUid",
      "authorName",
      "authorImage",
      "avatarSeed",
      "viewer",
    ],
  },
  PostResponse: {
    type: "object",
    properties: {
      post: ref("Post"),
      comments: { type: "array", items: ref("Comment") },
      commentsNextCursor: { type: ["string", "null"] },
      commentsSort: { type: "string", enum: ["hot", "latest"] },
      viewer: ref("PostViewer"),
    },
    required: [
      "post",
      "comments",
      "commentsNextCursor",
      "commentsSort",
      "viewer",
    ],
    additionalProperties: false,
  },
  PostCommentsResponse: {
    type: "object",
    properties: {
      comments: { type: "array", items: ref("Comment") },
      commentsNextCursor: { type: ["string", "null"] },
      commentsSort: { type: "string", enum: ["hot", "latest"] },
    },
    required: ["comments", "commentsNextCursor", "commentsSort"],
    additionalProperties: false,
  },
  PostListResponse: {
    type: "object",
    properties: {
      posts: { type: "array", items: ref("PostListItem") },
      nextCursor: { type: ["string", "null"] },
      seed: { type: "integer", minimum: 0 },
    },
    required: ["posts", "nextCursor"],
    additionalProperties: false,
  },
  PostMutationResponse: {
    type: "object",
    properties: { post: ref("Post"), moderationQueued: { type: "boolean" } },
    required: ["post"],
    additionalProperties: false,
  },
  CommentMutationResponse: {
    type: "object",
    properties: {
      comment: ref("Comment"),
      moderationQueued: { type: "boolean" },
    },
    required: ["comment"],
    additionalProperties: false,
  },
  ReactionResponse: {
    type: "object",
    properties: { active: { type: "boolean" }, likeCount: { type: "integer" } },
    required: ["active", "likeCount"],
    additionalProperties: false,
  },
  PostAttachment: {
    type: "object",
    properties: {
      contentUrl: { type: "string" },
      fileName: { type: "string" },
      height: { type: ["integer", "null"] },
      id: { type: "string", format: "uuid" },
      mediaType: { type: "string" },
      position: { type: "integer" },
      size: { type: "integer" },
      width: { type: ["integer", "null"] },
    },
    required: [
      "contentUrl",
      "fileName",
      "height",
      "id",
      "mediaType",
      "position",
      "size",
      "width",
    ],
    additionalProperties: true,
  },
  Attachment: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      fileName: { type: "string" },
      mediaType: { type: "string" },
      size: { type: "integer" },
      width: { type: ["integer", "null"] },
      height: { type: ["integer", "null"] },
      status: { type: "string" },
      moderationStatus: { type: "string" },
      createdAt: { type: "integer" },
      expiresAt: { type: "integer" },
      uploadUrl: { type: ["string", "null"] },
      multipart: { anyOf: [{ type: "null" }, ref("MultipartUploadPlan")] },
      downloadUrl: { type: ["string", "null"] },
      failureCode: { type: ["string", "null"] },
    },
    required: [
      "id",
      "fileName",
      "mediaType",
      "size",
      "width",
      "height",
      "status",
      "moderationStatus",
      "createdAt",
      "expiresAt",
      "uploadUrl",
      "multipart",
      "downloadUrl",
      "failureCode",
    ],
    additionalProperties: true,
  },
  MultipartUploadPlan: {
    type: "object",
    properties: {
      partSize: { type: "integer" },
      partCount: { type: "integer" },
      partUploadUrl: { type: "string" },
      completeUrl: { type: "string" },
      cancelUrl: { type: "string" },
    },
    required: [
      "partSize",
      "partCount",
      "partUploadUrl",
      "completeUrl",
      "cancelUrl",
    ],
    additionalProperties: false,
  },
  AttachmentResponse: {
    type: "object",
    properties: { attachment: ref("Attachment") },
    required: ["attachment"],
    additionalProperties: false,
  },
  AttachmentNullableResponse: {
    type: "object",
    properties: {
      attachment: { anyOf: [ref("Attachment"), { type: "null" }] },
    },
    required: ["attachment"],
    additionalProperties: false,
  },
  MultipartCompleteRequest: {
    type: "object",
    properties: {
      parts: {
        type: "array",
        items: {
          type: "object",
          properties: {
            partNumber: { type: "integer" },
            etag: { type: "string" },
          },
          required: ["partNumber", "etag"],
          additionalProperties: false,
        },
      },
    },
    additionalProperties: true,
  },
  UploadPartResponse: {
    type: "object",
    properties: {
      attachment: ref("Attachment"),
      part: {
        type: "object",
        properties: {
          partNumber: { type: "integer" },
          etag: { type: "string" },
          byteSize: { type: "integer" },
        },
        required: ["partNumber", "etag", "byteSize"],
        additionalProperties: false,
      },
    },
    required: ["attachment", "part"],
    additionalProperties: false,
  },
  UploadCompletionResponse: {
    type: "object",
    properties: {
      attachment: { anyOf: [ref("Attachment"), { type: "null" }] },
    },
    required: ["attachment"],
    additionalProperties: false,
  },
  AttachmentMetadataResponse: {
    type: "object",
    properties: {
      attachment: ref("Attachment"),
      parts: {
        type: "array",
        items: { type: "object", additionalProperties: true },
      },
    },
    required: ["attachment", "parts"],
    additionalProperties: false,
  },
  UploadIntentRequest: {
    type: "object",
    properties: {
      fileName: { type: "string" },
      mediaType: { type: "string" },
      size: { type: "integer", minimum: 1, maximum: 134217728 },
    },
    required: ["fileName", "mediaType", "size"],
  },
  PostAttachmentsRequest: {
    type: "object",
    properties: {
      attachmentIds: {
        type: "array",
        minItems: 1,
        maxItems: 16,
        uniqueItems: true,
        items: { type: "string", format: "uuid" },
      },
    },
    required: ["attachmentIds"],
    additionalProperties: false,
  },
  PostAttachmentsResponse: {
    type: "object",
    properties: { attachments: { type: "array", items: ref("Attachment") } },
    required: ["attachments"],
    additionalProperties: false,
  },
  DetachedAttachmentResponse: {
    type: "object",
    properties: {
      attachmentId: { type: "string", format: "uuid" },
      detached: { const: true },
      postId: { type: "string", format: "uuid" },
    },
    required: ["attachmentId", "detached", "postId"],
    additionalProperties: false,
  },
  UploadPolicyResponse: {
    type: "object",
    properties: {
      limits: {
        type: "object",
        properties: {
          attachmentsPerPost: { const: 16 },
          fileBytes: { const: 134217728 },
          partBytes: { const: 8388608 },
          videoSeconds: { const: 600 },
        },
        required: [
          "attachmentsPerPost",
          "fileBytes",
          "partBytes",
          "videoSeconds",
        ],
        additionalProperties: false,
      },
    },
    required: ["limits"],
    additionalProperties: false,
  },
  ProfileResponse: {
    type: "object",
    properties: { profile: ref("Profile") },
    required: ["profile"],
    additionalProperties: false,
  },
  Profile: {
    type: "object",
    additionalProperties: false,
    properties: {
      accountName: { type: "string" },
      avatarSeed: { type: "string" },
      avatarUrl: { type: ["string", "null"] },
      bio: { type: ["string", "null"] },
      candidateDisplayName: { type: ["string", "null"] },
      displayName: { type: ["string", "null"] },
      displayNameRevision: { type: "integer" },
      displayNameStatus: {
        type: "string",
        enum: ["allow", "block", "pending"],
      },
      handle: { type: ["string", "null"] },
      profileStatus: { type: "string" },
      publicUid: { type: "integer" },
      role: { type: "string" },
      version: { type: "integer" },
    },
    required: [
      "accountName",
      "avatarSeed",
      "avatarUrl",
      "bio",
      "candidateDisplayName",
      "displayName",
      "displayNameRevision",
      "displayNameStatus",
      "handle",
      "profileStatus",
      "publicUid",
      "role",
      "version",
    ],
  },
  ProfilePatch: {
    type: "object",
    properties: {
      displayName: { type: "string", maxLength: 80 },
      handle: { type: ["string", "null"], maxLength: 32 },
      bio: { type: ["string", "null"], maxLength: 500 },
      version: { type: "integer", minimum: 1 },
    },
    anyOf: [
      { required: ["displayName"] },
      { required: ["handle"] },
      { required: ["bio"] },
    ],
    additionalProperties: false,
  },
  DeleteProfileRequest: {
    type: "object",
    properties: { confirmation: { type: "string", format: "email" } },
    required: ["confirmation"],
    additionalProperties: false,
  },
  PendingAvatarResponse: {
    type: "object",
    properties: {
      avatar: {
        type: "object",
        properties: { status: { const: "pending" } },
        required: ["status"],
        additionalProperties: false,
      },
    },
    required: ["avatar"],
    additionalProperties: false,
  },
  PreferencesPatch: {
    type: "object",
    properties: {
      locale: {
        type: ["string", "null"],
        enum: ["ja", "en", "zh-TW", "zh-CN", "ko", null],
      },
      releaseServer: { type: ["string", "null"] },
      settings: {},
    },
    additionalProperties: true,
  },
  PreferencesResponse: {
    type: "object",
    properties: {
      preferences: {
        anyOf: [
          { type: "null" },
          { type: "object", additionalProperties: true },
        ],
      },
    },
    required: ["preferences"],
    additionalProperties: false,
  },
  NotificationsResponse: {
    type: "object",
    properties: {
      notifications: {
        type: "array",
        items: { type: "object", additionalProperties: true },
      },
      nextCursor: { type: ["string", "null"] },
      unreadCount: { type: "integer" },
    },
    required: ["notifications", "nextCursor", "unreadCount"],
    additionalProperties: false,
  },
  MarkAllReadResponse: {
    type: "object",
    properties: {
      readAt: { type: "integer" },
      updatedCount: { type: "integer" },
    },
    required: ["readAt", "updatedCount"],
    additionalProperties: false,
  },
  MarkReadResponse: {
    type: "object",
    properties: { id: { type: "string" }, readAt: { type: "integer" } },
    required: ["id", "readAt"],
    additionalProperties: false,
  },
  Tag: {
    type: "object",
    additionalProperties: true,
    properties: {
      id: { type: "string" },
      normalizedName: { type: "string" },
      displayName: { type: "string" },
      description: { type: ["string", "null"] },
      postCount: { type: "integer" },
      followerCount: { type: "integer" },
      preference: { type: ["string", "null"], enum: ["follow", "mute", null] },
    },
    required: [
      "id",
      "normalizedName",
      "displayName",
      "description",
      "postCount",
      "followerCount",
      "preference",
    ],
  },
  TagListResponse: {
    type: "object",
    properties: {
      tags: { type: "array", items: ref("Tag") },
      nextCursor: { type: ["string", "null"] },
    },
    required: ["tags", "nextCursor"],
    additionalProperties: false,
  },
  ResolvedTag: {
    type: "object",
    additionalProperties: true,
    properties: {
      id: { type: "string" },
      normalizedName: { type: "string" },
      displayName: { type: "string" },
      description: { type: ["string", "null"] },
      status: { type: "string" },
    },
    required: ["id", "normalizedName", "displayName", "description", "status"],
  },
  TagPreferencesResponse: {
    type: "object",
    properties: {
      preferences: {
        type: "array",
        items: {
          type: "object",
          properties: {
            kind: { type: "string", enum: ["follow", "mute"] },
            createdAt: { type: "integer" },
            tag: ref("ResolvedTag"),
          },
          required: ["kind", "createdAt", "tag"],
          additionalProperties: false,
        },
      },
      nextCursor: { type: ["string", "null"] },
    },
    required: ["preferences", "nextCursor"],
    additionalProperties: false,
  },
  TagPreferenceRequest: {
    type: "object",
    properties: {
      preference: { type: ["string", "null"], enum: ["follow", "mute", null] },
    },
    required: ["preference"],
    additionalProperties: false,
  },
  TagPreferenceMutationResponse: {
    type: "object",
    properties: {
      preference: { type: ["string", "null"], enum: ["follow", "mute", null] },
      tag: ref("ResolvedTag"),
    },
    required: ["preference", "tag"],
    additionalProperties: false,
  },
  UserRelationship: {
    type: "object",
    additionalProperties: false,
    properties: {
      following: { type: "boolean" },
      followedBy: { type: "boolean" },
      blocked: { type: "boolean" },
      blocking: { type: "boolean" },
      blockedBy: { type: "boolean" },
      muted: { type: "boolean" },
      muting: { type: "boolean" },
      canFollow: { type: "boolean" },
    },
    required: [
      "following",
      "followedBy",
      "blocked",
      "blocking",
      "blockedBy",
      "muted",
      "muting",
      "canFollow",
    ],
  },
  UserRelationshipResponse: {
    type: "object",
    properties: {
      user: {
        type: "object",
        properties: {
          uid: { type: "integer" },
          name: { type: "string" },
          image: { type: ["string", "null"] },
        },
        required: ["uid", "name", "image"],
        additionalProperties: false,
      },
      relationship: ref("UserRelationship"),
      viewer: ref("UserRelationship"),
    },
    required: ["user", "relationship", "viewer"],
    additionalProperties: false,
  },
  FeedbackRequest: {
    type: "object",
    properties: {
      feedback: {
        type: ["string", "null"],
        enum: ["not_interested", "hide", null],
      },
      reasonCode: { type: ["string", "null"] },
    },
    required: ["feedback"],
    additionalProperties: false,
  },
  FeedbackResponse: {
    type: "object",
    properties: { feedback: {} },
    required: ["feedback"],
    additionalProperties: false,
  },
  ClearedFeedbackResponse: {
    type: "object",
    properties: { cleared: { type: "integer" } },
    required: ["cleared"],
    additionalProperties: false,
  },
  ReportRequest: {
    type: "object",
    properties: {
      targetKind: { type: "string", enum: ["post", "comment", "user"] },
      targetId: {},
      reasonCode: {
        type: "string",
        enum: [
          "spam",
          "harassment",
          "hate",
          "sexual",
          "violence",
          "privacy",
          "copyright",
          "misinformation",
          "other",
        ],
      },
      details: { type: "string", maxLength: 2000 },
    },
    required: ["targetKind", "targetId", "reasonCode"],
    additionalProperties: false,
  },
  ReportResponse: {
    type: "object",
    properties: { report: { type: "object", additionalProperties: true } },
    required: ["report"],
    additionalProperties: false,
  },
  DeletedCommentResponse: {
    type: "object",
    properties: { comment: { type: "object", additionalProperties: true } },
    required: ["comment"],
    additionalProperties: false,
  },
  CommentActivityResponse: {
    type: "object",
    properties: {
      comments: {
        type: "array",
        items: { type: "object", additionalProperties: true },
      },
      nextCursor: { type: ["string", "null"] },
    },
    required: ["comments", "nextCursor"],
    additionalProperties: false,
  },
  Device: {
    type: "object",
    properties: {
      browserFamily: { type: ["string", "null"] },
      osFamily: { type: ["string", "null"] },
    },
    required: ["browserFamily", "osFamily"],
    additionalProperties: false,
  },
  IpLocation: {
    type: "object",
    properties: {
      countryCode: { type: "string" },
      regionCode: { type: ["string", "null"] },
      regionName: { type: ["string", "null"] },
    },
    required: ["countryCode", "regionCode", "regionName"],
    additionalProperties: false,
  },
  PublicProfile: {
    type: "object",
    additionalProperties: false,
    properties: {
      avatarSeed: { type: "string" },
      avatarUrl: { type: ["string", "null"] },
      bio: { type: ["string", "null"] },
      displayName: { type: ["string", "null"] },
      handle: { type: ["string", "null"] },
      joinedAt: { type: "integer" },
      owner: { type: "boolean" },
      role: { type: "string" },
      stats: { type: "object", additionalProperties: true },
      uid: { type: "integer" },
    },
    required: [
      "avatarSeed",
      "avatarUrl",
      "bio",
      "displayName",
      "handle",
      "joinedAt",
      "owner",
      "role",
      "stats",
      "uid",
    ],
  },
  PublicProfileViewer: {
    type: "object",
    additionalProperties: false,
    properties: {
      blocked: { type: "boolean" },
      followedBy: { type: "boolean" },
      following: { type: "boolean" },
      muted: { type: "boolean" },
      canInteract: { type: "boolean" },
    },
    required: ["blocked", "followedBy", "following", "muted", "canInteract"],
  },
  PublicProfileResponse: {
    type: "object",
    properties: {
      profile: ref("PublicProfile"),
      viewer: ref("PublicProfileViewer"),
      posts: {
        type: "array",
        items: { type: "object", additionalProperties: true },
      },
      postsNextCursor: { type: ["string", "null"] },
      works: {
        type: "array",
        items: { type: "object", additionalProperties: true },
      },
      gameAccounts: {
        type: "array",
        items: { type: "object", additionalProperties: true },
      },
    },
    required: [
      "profile",
      "viewer",
      "posts",
      "postsNextCursor",
      "works",
      "gameAccounts",
    ],
    additionalProperties: false,
  },
  BestdoriRecordMap: { type: "object", additionalProperties: true },
  BestdoriBand: {
    type: "object",
    additionalProperties: true,
    properties: {
      bandId: { type: "integer" },
      bandName: {},
      official: { type: "boolean" },
      memberBandIds: { type: "array", items: { type: "integer" } },
      memberCharacterIds: { type: "array", items: { type: "integer" } },
      memberNames: { type: "array", items: { type: "string" } },
    },
    required: ["bandId", "bandName", "official"],
  },
  BestdoriDifficulty: {
    type: "object",
    additionalProperties: true,
    properties: {
      difficulty: { type: "string" },
      playLevel: { type: ["number", "null"] },
      noteCount: { type: ["number", "null"] },
      publishedAt: {
        type: ["array", "null"],
        items: { type: ["number", "null"] },
      },
      file: { type: "string" },
    },
    required: ["difficulty", "playLevel", "noteCount", "publishedAt", "file"],
  },
  BestdoriSong: {
    type: "object",
    additionalProperties: true,
    properties: {
      musicId: { type: "integer" },
      musicTitle: {},
      bandId: { type: ["integer", "null"] },
      jacketUrl: { type: "string" },
      jacketThumbUrl: { type: "string" },
      musicUrl: { type: "string" },
      publishedAt: {
        type: ["array", "null"],
        items: { type: ["number", "null"] },
      },
      releaseAt: { type: ["number", "null"] },
      difficulty: { type: "array", items: ref("BestdoriDifficulty") },
    },
    required: [
      "musicId",
      "musicTitle",
      "bandId",
      "jacketUrl",
      "jacketThumbUrl",
      "musicUrl",
      "publishedAt",
      "releaseAt",
      "difficulty",
    ],
  },
  BestdoriSongMeta: { type: "object", additionalProperties: true },
  BestdoriCharacter: {
    type: "object",
    additionalProperties: true,
    properties: {
      characterId: { type: "integer" },
      characterName: {},
      bandId: { type: ["number", "null"] },
      colorCode: {},
    },
    required: ["characterId", "characterName", "bandId", "colorCode"],
  },
  BestdoriCard: {
    type: "object",
    additionalProperties: true,
    properties: {
      cardId: { type: "integer" },
      characterId: { type: ["number", "null"] },
      rarity: { type: ["number", "null"] },
      releasedAt: {
        type: ["array", "null"],
        items: { type: ["number", "null"] },
      },
      releaseAt: { type: ["number", "null"] },
      hasStory: { type: "boolean" },
      resourceSetName: { type: ["string", "null"] },
      episodes: {
        type: "array",
        items: { type: "object", additionalProperties: true },
      },
    },
    required: [
      "cardId",
      "characterId",
      "rarity",
      "releasedAt",
      "releaseAt",
      "hasStory",
      "resourceSetName",
      "episodes",
    ],
  },
  BestdoriBandMap: {
    type: "object",
    additionalProperties: ref("BestdoriBand"),
  },
  BestdoriSongMap: {
    type: "object",
    additionalProperties: ref("BestdoriSong"),
  },
  BestdoriSongMetaMap: {
    type: "object",
    additionalProperties: ref("BestdoriSongMeta"),
  },
  BestdoriCharacterMap: {
    type: "object",
    additionalProperties: ref("BestdoriCharacter"),
  },
  BestdoriCardMap: {
    type: "object",
    additionalProperties: ref("BestdoriCard"),
  },
  BestdoriStoryDocument: { type: "object", additionalProperties: true },
  BestdoriEditorAssetResponse: {
    type: "object",
    properties: {
      server: { type: "string" },
      tree: { type: "object", additionalProperties: true },
      files: { type: "array", items: { type: "string" } },
      path: { type: "string" },
    },
    required: ["server"],
    additionalProperties: true,
  },
  BestdoriLive2dResponse: {
    type: "object",
    properties: {
      items: { type: "object", additionalProperties: true },
      missing: { type: "array", items: { type: "string" } },
    },
    required: ["items", "missing"],
    additionalProperties: false,
  },
  BetterAuthResponse: { ...anyObject },
};

for (const [path, item] of Object.entries(paths)) {
  if (item.get && !path.startsWith("/api/auth/") && !item.head)
    item.head = { ...item.get, operationId: `${item.get.operationId}Head` };
}

const document = {
  openapi: "3.1.0",
  info: {
    title: "Haneoka Public API",
    version: "2026-09-30",
    description:
      "Public HTTP contracts served by haneoka.org. Manifest-driven catalog DTOs and provider projections retain their published fields; stable envelopes and transport behavior are described explicitly.",
  },
  servers: [{ url: "https://haneoka.org", description: "Production" }],
  tags: [
    {
      name: "Latest resource API",
      description:
        "Current catalog aliases with intl as the default server and an optional server query.",
    },
    {
      name: "Resource servers",
      description:
        "Release discovery, immutable release selection, catalog documents, and release-backed files.",
    },
    {
      name: "Sonolus",
      description:
        "Public Sonolus server documents, levels, playlists, and data.",
    },
    {
      name: "Community",
      description:
        "Public community reads and authenticated account interactions.",
    },
    {
      name: "Authentication",
      description:
        "Account availability, registration, and Better Auth sessions.",
    },
    {
      name: "Provider APIs",
      description: "Garupa and Bestdori provider projections.",
    },
  ],
  security: [],
  paths,
  components: {
    securitySchemes: {
      cookieSession: {
        type: "apiKey",
        in: "cookie",
        name: "__Secure-haneoka.session_token",
        description:
          "HTTP-only Better Auth session cookie. Let the browser set it; do not copy a real value into code or logs.",
      },
    },
    schemas,
  },
};

await mkdir("public", { recursive: true });
await writeFile(
  "public/openapi.json",
  `${JSON.stringify(document, null, 2)}\n`,
  "utf8",
);
