// Shared localisation helpers for the API reference data.
//
// Every user-visible string in src/data/api is an object keyed by the
// Starlight locale slug ("en" stands for the root locale). The helper keeps
// the five translations next to each other so a missing language is easy to
// spot in review and is rejected by `assertLocalized` at build time.

export const LOCALES = /** @type {const} */ (["en", "ja", "ko", "zh-cn", "zh-tw"]);

/** Starlight locale slug → BCP-47 language tag. */
export const LANG = { en: "en", ja: "ja", ko: "ko", "zh-cn": "zh-CN", "zh-tw": "zh-TW" };

/** Build a localised string: English, Japanese, Korean, Simplified Chinese, Traditional Chinese. */
export const L = (en, ja, ko, zhCN, zhTW) => ({ en, ja, ko, "zh-cn": zhCN, "zh-tw": zhTW });

/** The same text in every language (identifiers, code, proper nouns). */
export const same = (text) => L(text, text, text, text, text);

export function assertLocalized(value, where) {
  if (!value || typeof value !== "object") throw new Error(`Missing localized text at ${where}`);
  for (const locale of LOCALES) {
    if (typeof value[locale] !== "string" || !value[locale].trim()) {
      throw new Error(`Missing ${locale} text at ${where}`);
    }
  }
}

/** Resolve a localised value for the given locale slug. */
export const tr = (value, locale) => (value && typeof value === "object" ? value[locale] ?? value.en : value);

/** Map an Astro `currentLocale` (BCP-47 or slug) to our locale slug. */
export function localeSlug(value) {
  const v = String(value || "en").toLowerCase();
  if (v.startsWith("zh") && (v.includes("tw") || v.includes("hant"))) return "zh-tw";
  if (v.startsWith("zh")) return "zh-cn";
  if (v.startsWith("ja")) return "ja";
  if (v.startsWith("ko")) return "ko";
  return "en";
}

/** Prefix a root-relative docs link with the locale directory. */
export function localizeHref(href, locale) {
  if (!href.startsWith("/") || href.startsWith("//") || locale === "en") return href;
  if (/^\/(?:openapi\.json|llms(?:-full)?\.txt|examples\/)/u.test(href)) return href;
  return `/${locale}${href}`;
}

/** Labels used by the reference components. */
export const UI = {
  parameters: L("Parameters", "パラメーター", "매개변수", "参数", "參數"),
  name: L("Name", "名前", "이름", "名称", "名稱"),
  in: L("In", "場所", "위치", "位置", "位置"),
  type: L("Type", "型", "타입", "类型", "型別"),
  description: L("Description", "説明", "설명", "说明", "說明"),
  required: L("required", "必須", "필수", "必填", "必填"),
  optional: L("optional", "任意", "선택", "可选", "選填"),
  default: L("Default", "既定値", "기본값", "默认值", "預設值"),
  path: L("path", "パス", "경로", "路径", "路徑"),
  query: L("query", "クエリ", "쿼리", "查询", "查詢"),
  header: L("header", "ヘッダー", "헤더", "请求头", "標頭"),
  requestBody: L("Request body", "リクエストボディ", "요청 본문", "请求体", "請求主體"),
  responseFields: L("Response fields", "レスポンスのフィールド", "응답 필드", "响应字段", "回應欄位"),
  responses: L("Responses", "レスポンス", "응답", "响应", "回應"),
  status: L("Status", "ステータス", "상태", "状态码", "狀態碼"),
  example: L("Example", "例", "예시", "示例", "範例"),
  exampleRequest: L("Example request", "リクエスト例", "요청 예시", "请求示例", "請求範例"),
  exampleResponse: L("Example response", "レスポンス例", "응답 예시", "响应示例", "回應範例"),
  errors: L("Errors", "エラー", "오류", "错误", "錯誤"),
  code: L("Code", "コード", "코드", "代码", "代碼"),
  meaning: L("Meaning", "意味", "의미", "含义", "意義"),
  auth: L("Authentication", "認証", "인증", "认证", "驗證"),
  caching: L("Caching", "キャッシュ", "캐시", "缓存", "快取"),
  rateLimit: L("Rate limit", "レート制限", "속도 제한", "速率限制", "速率限制"),
  contentType: L("Content type", "Content-Type", "Content-Type", "Content-Type", "Content-Type"),
  noBody: L("No response body.", "レスポンスボディはありません。", "응답 본문이 없습니다.", "无响应体。", "沒有回應主體。"),
  trimmed: L(
    "Trimmed for length; the real response contains more entries.",
    "長さのため一部を省略しています。実際のレスポンスにはさらに多くの項目があります。",
    "길이 때문에 일부를 생략했습니다. 실제 응답에는 더 많은 항목이 있습니다.",
    "为节省篇幅已截断，实际响应包含更多条目。",
    "為節省篇幅已截斷，實際回應包含更多項目。",
  ),
  binary: L("Binary body (not shown).", "バイナリ本文（表示しません）。", "바이너리 본문(표시하지 않음).", "二进制内容（不显示）。", "二進位內容（不顯示）。"),
  opaque: L(
    "JSON body whose shape is internal to the haneoka.org client; treat it as opaque.",
    "haneoka.org クライアント内部の形式の JSON 本文です。中身に依存しないでください。",
    "haneoka.org 클라이언트 내부 형식의 JSON 본문입니다. 내용에 의존하지 마세요.",
    "JSON 响应体的结构属于 haneoka.org 客户端内部实现，请视为不透明数据。",
    "JSON 回應主體的結構屬於 haneoka.org 用戶端內部實作，請視為不透明資料。",
  ),
  seeAlso: L("See also", "関連項目", "함께 보기", "另请参阅", "另請參閱"),
};

export const AUTH = {
  localTools: L("Local service Bearer token. Read the private headers file printed at startup.", "ローカルサービスの Bearer。起動時の非公開ヘッダーファイルを使用。", "로컬 서비스 Bearer 토큰. 시작 시 표시된 비공개 헤더 파일을 사용하세요.", "本地服务 Bearer 令牌，读取启动时给出的私有请求头文件。", "本機服務 Bearer 權杖，讀取啟動時提供的私人請求標頭檔。"),
  gameApplication: L("Application key in X-Game-Application-Key, with explicit access to this save.", "このセーブへの許可を持つアプリキーを X-Game-Application-Key に指定。", "저장 파일 권한이 있는 앱 키를 X-Game-Application-Key에 전달하세요.", "在 X-Game-Application-Key 中传入有该存档明确授权的应用密钥。", "在 X-Game-Application-Key 中傳入有該存檔明確授權的應用金鑰。"),
  none: L("None. Public, anonymous read.", "不要。誰でも匿名で読み取れます。", "필요 없음. 누구나 익명으로 읽을 수 있습니다.", "无需认证，可匿名公开读取。", "無需驗證，可匿名公開讀取。"),
  optional: L(
    "Optional. Anonymous requests see public content; a session cookie adds the viewer's own state. No CORS headers are sent, so call it from a server (or from haneoka.org), not from browser code on another site.",
    "任意。匿名では公開コンテンツのみ、セッション Cookie があると閲覧者自身の状態も返します。CORS ヘッダーは送られないため、他サイトのブラウザーのコードではなく、サーバー（または haneoka.org）から呼んでください。",
    "선택. 익명 요청은 공개 콘텐츠만 보고, 세션 쿠키가 있으면 보는 사람의 상태가 추가됩니다. CORS 헤더를 보내지 않으므로 다른 사이트의 브라우저 코드가 아니라 서버(또는 haneoka.org)에서 호출하세요.",
    "可选。匿名请求只看到公开内容；带会话 Cookie 时会附带当前用户自己的状态。不发送 CORS 响应头，因此请从服务器（或 haneoka.org）调用，而不是在其他网站的浏览器代码中调用。",
    "選填。匿名請求只會看到公開內容；帶有工作階段 Cookie 時會附帶目前使用者自己的狀態。不傳送 CORS 標頭，因此請從伺服器（或 haneoka.org）呼叫，而不是在其他網站的瀏覽器程式碼中呼叫。",
  ),
  session: L(
    "Required. Send the `haneoka` session cookie from a signed-in browser.",
    "必須。サインイン済みブラウザーの `haneoka` セッション Cookie を送信します。",
    "필수. 로그인한 브라우저의 `haneoka` 세션 쿠키를 보내야 합니다.",
    "必需。需要携带已登录浏览器的 `haneoka` 会话 Cookie。",
    "必需。需要攜帶已登入瀏覽器的 `haneoka` 工作階段 Cookie。",
  ),
  sessionWrite: L(
    "Required: a session cookie, a verified email, an active account and a same-origin request from `https://haneoka.org`.",
    "必須：セッション Cookie、確認済みメールアドレス、有効なアカウント、そして `https://haneoka.org` からの同一オリジンリクエスト。",
    "필수: 세션 쿠키, 인증된 이메일, 활성 계정, 그리고 `https://haneoka.org`에서 보낸 동일 출처 요청.",
    "必需：会话 Cookie、已验证邮箱、状态正常的账号，以及来自 `https://haneoka.org` 的同源请求。",
    "必需：工作階段 Cookie、已驗證的電子郵件、狀態正常的帳號，以及來自 `https://haneoka.org` 的同源請求。",
  ),
  sameOriginRead: L(
    "Same-origin only. Browsers on other sites are rejected with `403 cross_origin_request`; a session cookie is optional.",
    "同一オリジンのみ。他サイトのブラウザーからは `403 cross_origin_request` で拒否されます。セッション Cookie は任意です。",
    "동일 출처 전용. 다른 사이트의 브라우저 요청은 `403 cross_origin_request`로 거부됩니다. 세션 쿠키는 선택입니다.",
    "仅限同源。其他网站的浏览器请求会被 `403 cross_origin_request` 拒绝；会话 Cookie 可选。",
    "僅限同源。其他網站的瀏覽器請求會被 `403 cross_origin_request` 拒絕；工作階段 Cookie 為選填。",
  ),
  sync: L(
    "Required: a session cookie, the `X-Haneoka-Expected-User` header and a same-origin request.",
    "必須：セッション Cookie、`X-Haneoka-Expected-User` ヘッダー、同一オリジンリクエスト。",
    "필수: 세션 쿠키, `X-Haneoka-Expected-User` 헤더, 동일 출처 요청.",
    "必需：会话 Cookie、`X-Haneoka-Expected-User` 请求头以及同源请求。",
    "必需：工作階段 Cookie、`X-Haneoka-Expected-User` 標頭以及同源請求。",
  ),
  betterAuth: L(
    "Handled by Better Auth. Browser flows only; responses set or clear the session cookie.",
    "Better Auth が処理します。ブラウザー向けのフローで、レスポンスがセッション Cookie を設定または削除します。",
    "Better Auth가 처리합니다. 브라우저 전용 흐름이며 응답이 세션 쿠키를 설정하거나 삭제합니다.",
    "由 Better Auth 处理。仅用于浏览器流程，响应会设置或清除会话 Cookie。",
    "由 Better Auth 處理。僅用於瀏覽器流程，回應會設定或清除工作階段 Cookie。",
  ),
};

export const RATE = {
  community: L(
    "20 writes per minute per account (shared community limiter). Exceeding it returns `429 rate_limit_exceeded` with `Retry-After: 60`.",
    "アカウントごとに毎分 20 回の書き込み（コミュニティ共通の制限）。超えると `429 rate_limit_exceeded` と `Retry-After: 60` を返します。",
    "계정당 분당 20회 쓰기(커뮤니티 공용 제한). 초과하면 `Retry-After: 60`과 함께 `429 rate_limit_exceeded`를 반환합니다.",
    "每个账号每分钟 20 次写入（社区共用限制）。超出时返回 `429 rate_limit_exceeded` 和 `Retry-After: 60`。",
    "每個帳號每分鐘 20 次寫入（社群共用限制）。超出時回傳 `429 rate_limit_exceeded` 與 `Retry-After: 60`。",
  ),
  scoped: L(
    "20 requests per minute per account for this operation. Exceeding it returns `429 rate_limit_exceeded`.",
    "この操作はアカウントごとに毎分 20 回まで。超えると `429 rate_limit_exceeded` を返します。",
    "이 작업은 계정당 분당 20회까지입니다. 초과하면 `429 rate_limit_exceeded`를 반환합니다.",
    "此操作每个账号每分钟最多 20 次，超出时返回 `429 rate_limit_exceeded`。",
    "此操作每個帳號每分鐘最多 20 次，超出時回傳 `429 rate_limit_exceeded`。",
  ),
  registration: L(
    "20 requests per minute per client IP address; `429 rate_limit_exceeded` with `Retry-After: 60`.",
    "クライアント IP アドレスごとに毎分 20 回。超えると `429 rate_limit_exceeded` と `Retry-After: 60`。",
    "클라이언트 IP 주소당 분당 20회. 초과하면 `Retry-After: 60`과 함께 `429 rate_limit_exceeded`.",
    "每个客户端 IP 地址每分钟 20 次；超出时返回 `429 rate_limit_exceeded` 和 `Retry-After: 60`。",
    "每個用戶端 IP 位址每分鐘 20 次；超出時回傳 `429 rate_limit_exceeded` 與 `Retry-After: 60`。",
  ),
  none: L(
    "No per-client limit. Cached at the edge; be considerate with uncached bulk reads.",
    "クライアント単位の制限はありません。エッジでキャッシュされます。キャッシュされない大量読み取りは控えめに。",
    "클라이언트별 제한은 없습니다. 엣지에서 캐시됩니다. 캐시되지 않는 대량 읽기는 자제해 주세요.",
    "没有按客户端的限制，由边缘节点缓存；请节制不走缓存的批量读取。",
    "沒有依用戶端的限制，由邊緣節點快取；請節制不經快取的大量讀取。",
  ),
};
