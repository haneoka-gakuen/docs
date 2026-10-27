import { L } from "../i18n.mjs";
import contract from "../game-contract.json" with { type: "json" };
const titles = [
 L("Player profile", "プレイヤープロフィール", "플레이어 프로필", "玩家资料", "玩家資料"),
 L("Batch player profiles", "プロフィールの一括取得", "프로필 일괄 조회", "批量玩家资料", "批次玩家資料"),
 L("Account favorites", "アカウントのお気に入り", "계정 즐겨찾기", "账号收藏", "帳號收藏"),
 L("Profile card image", "プロフィールカード画像", "프로필 카드 이미지", "资料卡图片", "資料卡圖片"),
 L("Song ranking", "楽曲ランキング", "곡 랭킹", "歌曲排行榜", "歌曲排行榜"),
 L("Event point ranking", "イベントポイントランキング", "이벤트 포인트 랭킹", "活动积分榜", "活動積分榜"),
 L("Challenge ranking", "チャレンジランキング", "챌린지 랭킹", "挑战排行榜", "挑戰排行榜"),
 L("Player event deck", "イベント編成", "이벤트 편성", "玩家活动编队", "玩家活動編隊"),
 L("Arena ranking", "アリーナランキング", "아레나 랭킹", "竞技场排行榜", "競技場排行榜"),
 L("Arena deck trends", "アリーナ編成傾向", "아레나 편성 동향", "竞技场热门编队", "競技場熱門編隊"),
 L("Circle detail", "サークル詳細", "서클 상세", "圈子详情", "圈子詳情"),
 L("Search circles", "サークル検索", "서클 검색", "搜索圈子", "搜尋圈子"),
 L("Product and selected pickup rates", "商品・選択ピックアップ提供割合", "상품·선택 픽업 확률", "商品与自选 UP 概率", "商品與自選 UP 機率"),
 L("Live game announcements", "ゲーム内お知らせ", "게임 내 공지", "游戏内公告", "遊戲內公告"),
 L("Live announcement detail", "ゲーム内お知らせ詳細", "게임 내 공지 상세", "游戏公告详情", "遊戲公告詳情"),
];
const meanings = {
 page: L("Profile-card page, starting at 1.", "プロフィールカードのページ。1 から開始。", "프로필 카드 페이지. 1부터 시작합니다.", "资料卡页码，从 1 开始。", "資料卡頁碼，從 1 開始。"),
 songId: L("Song ID from the same region song catalog.", "同じ地域の楽曲カタログの ID。", "동일 지역 곡 카탈로그의 ID.", "同区服歌曲目录中的歌曲 ID。", "同區服歌曲目錄中的歌曲 ID。"),
 challengeId: L("Challenge music ID from the event challenge directory; distinct from songId.", "イベントのチャレンジ一覧の楽曲 ID。songId とは別です。", "이벤트 챌린지 목록의 곡 ID. songId와 다릅니다.", "活动挑战目录中的挑战歌曲 ID，与 songId 不同。", "活動挑戰目錄中的挑戰歌曲 ID，與 songId 不同。"),
 eventId: L("Event ID from the matching region catalog.", "同じ地域のイベントカタログの ID。", "동일 지역 이벤트 카탈로그의 ID.", "同区服活动目录中的活动 ID。", "同區服活動目錄中的活動 ID。"),
 seasonId: L("Arena season ID from the matching region catalog.", "同じ地域のアリーナシーズン ID。", "동일 지역 아레나 시즌 ID.", "同区服竞技场赛季 ID。", "同區服競技場賽季 ID。"),
 bandId: L("Optional band filter; omit for the overall arena ranking.", "バンドの絞り込み。全体順位では省略。", "밴드 필터. 전체 랭킹은 생략합니다.", "可选乐队筛选，省略读取综合竞技场榜。", "可選樂團篩選，省略讀取綜合競技場榜。"),
 circleId: L("Circle ID returned by circle search.", "サークル検索結果の ID。", "서클 검색 결과의 ID.", "圈子搜索结果中的圈子 ID。", "圈子搜尋結果中的圈子 ID。"),
 gachaId: L("Recruitment ID from the gacha catalog.", "ガチャカタログの ID。", "모집 카탈로그의 ID.", "招募目录中的招募 ID。", "招募目錄中的招募 ID。"),
 productId: L("Product ID from drawOptions[].id of the recruitment entity.", "ガチャ詳細の drawOptions[].id にある商品 ID。", "모집 상세의 drawOptions[].id 상품 ID.", "招募实体 drawOptions[].id 中的商品 ID。", "招募實體 drawOptions[].id 中的商品 ID。"),
 announcementId: L("Game announcement ID from the list in this region.", "同じ地域のお知らせ一覧にある ID。", "동일 지역 공지 목록의 ID.", "本区服公告列表返回的游戏公告 ID。", "本區服公告列表回傳的遊戲公告 ID。"),
 category: L("ALL, OPENING_EVENTS or BUG, or the numeric game enum.", "ALL、OPENING_EVENTS、BUG、またはゲームの数値 enum。", "ALL, OPENING_EVENTS, BUG 또는 게임 숫자 enum.", "ALL、OPENING_EVENTS、BUG，或游戏枚举数值。", "ALL、OPENING_EVENTS、BUG，或遊戲列舉數值。"),
 memberRange: L("MEMBER_RANGE_UNSPECIFIED or MEMBER_RANGE_1/2/3; numeric enums also accepted.", "MEMBER_RANGE_UNSPECIFIED または MEMBER_RANGE_1/2/3。数値 enum も可。", "MEMBER_RANGE_UNSPECIFIED 또는 MEMBER_RANGE_1/2/3. 숫자 enum도 가능합니다.", "MEMBER_RANGE_UNSPECIFIED 或 MEMBER_RANGE_1/2/3，也接受枚举数值。", "MEMBER_RANGE_UNSPECIFIED 或 MEMBER_RANGE_1/2/3，也接受列舉數值。"),
 joinRule: L("JOIN_RULE_UNSPECIFIED, AUTO, REQUEST or INVITE; numeric enums also accepted.", "JOIN_RULE_UNSPECIFIED、AUTO、REQUEST、INVITE。数値 enum も可。", "JOIN_RULE_UNSPECIFIED, AUTO, REQUEST, INVITE. 숫자 enum도 가능합니다.", "JOIN_RULE_UNSPECIFIED、AUTO、REQUEST、INVITE，也接受枚举数值。", "JOIN_RULE_UNSPECIFIED、AUTO、REQUEST、INVITE，也接受列舉數值。"),
 playStyle: L("PLAY_STYLE_UNSPECIFIED, FREE, CASUAL, HARD or BEGINNER; numeric enums also accepted.", "PLAY_STYLE_UNSPECIFIED、FREE、CASUAL、HARD、BEGINNER。数値 enum も可。", "PLAY_STYLE_UNSPECIFIED, FREE, CASUAL, HARD, BEGINNER. 숫자 enum도 가능합니다.", "PLAY_STYLE_UNSPECIFIED、FREE、CASUAL、HARD、BEGINNER，也接受枚举数值。", "PLAY_STYLE_UNSPECIFIED、FREE、CASUAL、HARD、BEGINNER，也接受列舉數值。"),
 region: L("Game region: jp, tw, en or kr. This is separate from the jp/intl resource server.", "ゲーム地域：jp、tw、en、kr。リソースサーバー jp/intl とは別です。", "게임 지역: jp, tw, en, kr. 리소스 서버 jp/intl과 구분합니다.", "游戏区服：jp、tw、en、kr，与资源服 jp/intl 分开。", "遊戲區服：jp、tw、en、kr，與資源服 jp/intl 分開。"),
 profileId: L("Public profile ID; jp: positive int64, tw/en/kr: 11 digits starting with 2/3/4.", "公開プロフィール ID。jp は正の int64、tw/en/kr は 2/3/4 で始まる 11 桁。", "공개 프로필 ID. jp는 양의 int64, tw/en/kr은 2/3/4로 시작하는 11자리.", "公开资料 ID：jp 为正 int64；tw/en/kr 为 2/3/4 开头的 11 位数字。", "公開資料 ID：jp 為正 int64；tw/en/kr 為 2/3/4 開頭的 11 位數字。"),
 accountId: L("Account ID, distinct from the public profile ID. Repeat accountId for a batch of 1–100 accounts.", "公開プロフィール ID とは異なるアカウント ID。一括取得は accountId を 1〜100 回指定。", "공개 프로필 ID와 다른 계정 ID. 일괄 조회는 accountId를 1~100회 반복합니다.", "账号 ID，与公开资料 ID 不同。批量查询重复 accountId，单次 1–100 个。", "帳號 ID，與公開資料 ID 不同。批次查詢重複 accountId，單次 1–100 個。"),
 rank: L("Requested positions, starting at 1. Repeat rank; 1–100 submitted positions. Missing positions remain absent.", "1 から始まる取得順位。rank を繰り返し、1〜100 件を指定。欠けた順位は補完しません。", "1부터 시작하는 요청 순위. rank를 반복해 1~100개를 지정합니다. 누락 순위는 채우지 않습니다.", "从 1 开始的指定名次。重复 rank，单次 1–100 项；缺失名次保持缺失。", "從 1 開始的指定名次。重複 rank，單次 1–100 項；缺少的名次保持缺少。"),
 start: L("First position, inclusive, starting at 1.", "開始順位。1 以上で、この順位を含みます。", "시작 순위. 1 이상이며 해당 순위를 포함합니다.", "起始名次，从 1 开始，包含此名次。", "起始名次，從 1 開始，包含此名次。"),
 end: L("Last position, inclusive; at least start.", "終了順位。この順位を含み、start 以上。", "끝 순위. 해당 순위를 포함하며 start 이상입니다.", "结束名次，包含此名次，须不小于 start。", "結束名次，包含此名次，須不小於 start。"),
 name: L("Exact circle name. Omit to use the other search filters.", "サークル名の完全一致。他の条件で検索する場合は省略。", "서클 이름 완전 일치. 다른 조건을 쓰면 생략합니다.", "圈子名称，精确匹配；也可省略并使用其他筛选。", "圈子名稱，完全比對；也可省略並使用其他篩選。"),
 pickupId: L("Selected pickup IDs. Repeat pickupId, at most 100 values.", "選択ピックアップ ID。pickupId を繰り返し、最大 100 件。", "선택 픽업 ID. pickupId를 반복하며 최대 100개입니다.", "自选 UP ID，重复 pickupId，最多 100 个。", "自選 UP ID，重複 pickupId，最多 100 個。"),
};
const fallback = name => L(`Game ${name}; keep integer IDs as decimal strings.`, `ゲームの ${name}。整数 ID は十進文字列で指定します。`, `게임 ${name}. 정수 ID는 십진 문자열로 전달합니다.`, `游戏 ${name}；整数 ID 使用十进制字符串。`, `遊戲 ${name}；整數 ID 使用十進位字串。`);
const errors = ["invalid_request", "not_found", "rate_limit_exceeded", { code: "data_unavailable", status: 503, desc: L("Game data is unavailable. Retry with backoff.", "ゲームデータを取得できません。間隔を空けて再試行。", "게임 데이터를 가져올 수 없습니다. 간격을 두고 재시도하세요.", "游戏数据暂时不可用，请退避重试。", "遊戲資料暫時無法取得，請退避重試。") }];
const sample = name => name === "region" ? "jp" : name === "songId" ? "100001" : name === "category" ? "ALL" : name === "name" ? "MyGO!!!!!" : name === "end" ? "100" : "1";
const examplePath = route => {
 let path = route.path.replace(/\{([^}]+)\}/gu, (_, name) => sample(name));
 const query = new URLSearchParams();
 for (const p of route.parameters.filter(p => p.in === "query" && (p.required || ["name", "category", "productId", "pickupId"].includes(p.name)))) {
  query.append(p.name, sample(p.name));
  if (p.name === "rank") query.append(p.name, "100");
 }
 return path + (query.size ? `?${query}` : "");
};
const responseFields = {
 playerProfile: L("Public profile, including account ID, profile ID, name, growth and display cards.", "アカウント ID、プロフィール ID、名前、育成、表示カードを含む公開プロフィール。", "계정 ID·프로필 ID·이름·성장·표시 카드를 포함한 공개 프로필.", "公开资料，含账号 ID、资料 ID、昵称、成长与展示卡牌。", "公開資料，含帳號 ID、資料 ID、暱稱、成長與展示卡牌。"),
 players: L("Players in returned order, with their supplied profile and deck fields.", "返された順序のプレイヤー一覧。取得したプロフィール・編成フィールドを保持。", "반환 순서의 플레이어 목록. 제공된 프로필·편성 필드를 유지합니다.", "按返回顺序排列的玩家，保留资料和编队字段。", "依回傳順序排列的玩家，保留資料與編隊欄位。"),
 totalFavorite: L("Favorite count as an int64 decimal string.", "お気に入り数。int64 の十進文字列。", "즐겨찾기 수. int64 십진 문자열.", "收藏数量，int64 十进制字符串。", "收藏數量，int64 十進位字串。"),
 ranking: L("Ranking entries with position, points and player information. Requested missing positions remain absent.", "順位・ポイント・プレイヤー情報。欠けた順位は補完しません。", "순위·포인트·플레이어 정보. 누락 순위는 채우지 않습니다.", "排行榜条目，含名次、积分与玩家信息；缺失的指定名次保持缺失。", "排行榜項目，含名次、積分與玩家資訊；缺少的指定名次保持缺少。"),
 deck: L("Deck and slot details, member cards, Snapshots and growth.", "編成とスロット、メンバー、スナップ、育成情報。", "편성·슬롯·멤버 카드·스냅·성장 정보.", "编队与槽位，含成员卡、留影与养成。", "編隊與欄位，含成員卡、留影與養成。"),
 maxRank: L("Largest available arena position as an int64 decimal string.", "取得できる最大アリーナ順位。int64 十進文字列。", "사용 가능한 최대 아레나 순위. int64 십진 문자열.", "可用的最大竞技场名次，int64 十进制字符串。", "可用的最大競技場名次，int64 十進位字串。"),
 circle: L("Circle, its leader, membership and player details.", "サークル、リーダー、メンバーとプレイヤー情報。", "서클·리더·멤버·플레이어 정보.", "圈子、圈主、成员与玩家详情。", "圈子、圈主、成員與玩家詳情。"),
 circles: L("Matching circles and their leaders.", "条件に一致するサークルとリーダー。", "조건과 일치하는 서클과 리더.", "匹配的圈子及其圈主。", "符合的圈子與其圈主。"),
 announcements: L("Game announcement records; int64 timestamps use decimal strings in seconds.", "ゲーム内お知らせ。int64 時刻は秒の十進文字列。", "게임 공지. int64 시각은 초 단위 십진 문자열.", "游戏公告记录；int64 时间戳为秒的十进制字符串。", "遊戲公告紀錄；int64 時間戳記為秒的十進位字串。"),
 announcement: L("Full game announcement, including its HTML body and publication times.", "HTML 本文と公開時刻を含むお知らせ全文。", "HTML 본문과 공개 시각을 포함한 전체 공지.", "完整游戏公告，含 HTML 正文与发布时间。", "完整遊戲公告，含 HTML 本文與發布時間。"),
};
const typeName = schema => schema.$ref ? schema.$ref.split("/").pop() : schema.type === "array" ? `${typeName(schema.items)}[]` : schema.type || "object";
const fieldsFor = route => {
 const schema = route.responses["200"]?.content?.["application/json"]?.schema;
 const body = schema?.$ref ? contract.schemas[schema.$ref.split("/").pop()] : schema;
 return Object.entries(body?.properties || {}).map(([name, schema]) => [name, typeName(schema), responseFields[name] || L(`Game ${name}. See the nested response schema in OpenAPI.`, `ゲームの ${name}。入れ子の型は OpenAPI を参照。`, `게임 ${name}. 중첩 형식은 OpenAPI를 참조하세요.`, `游戏 ${name}；嵌套结构见 OpenAPI 响应 schema。`, `遊戲 ${name}；巢狀結構見 OpenAPI 回應 schema。`)]);
};
const exampleResponses = [
 { playerProfile: { id: "1", profileId: "1", name: "Player" } }, { players: [{ id: "1", name: "Player" }] }, { totalFavorite: "10" }, null,
 { players: [{ score: 1108389, playerData: { id: "1", profileId: "1", name: "Player" }, highScoreDeck: { cards: [] } }] },
 { ranking: [{ rank: 1, point: 100000, profile: { id: "1", name: "Player" } }] }, { players: [] }, { deck: { cards: [] } }, { maxRank: "100", ranking: [] },
 { leaders: [], members: [], supports: [] }, { circle: { circle: { id: "1", name: "MyGO!!!!!" } } }, { circles: [] },
 { lot: [{ lotId: "1", probabilityPercent: "3.00" }], prize: [{ prizeId: "1", probabilityPercent: "0.50" }], products: {} },
 { announcements: [{ id: "1", title: "Announcement", startAt: "1793030400" }] }, { announcement: { id: "1", title: "Announcement", body: "<p>…</p>" } },
];
const snapshotPaths = [
 ["events/views/live", L("Tracked events", "追跡イベント", "추적 이벤트", "活动追踪目录", "活動追蹤目錄")],
 ["events/views/current", L("Current event", "現在のイベント", "현재 이벤트", "当前活动", "目前活動")],
 ["events/{eventId}/snapshots", L("Event collection state", "イベント収集状態", "이벤트 수집 상태", "活动采集状态", "活動採集狀態")],
 ["events/{eventId}/snapshots/latest", L("Event cutoff snapshot", "ボーダースナップショット", "컷오프 스냅샷", "活动榜线快照", "活動榜線快照")],
 ["events/{eventId}/challenges", L("Event challenges", "イベントチャレンジ", "이벤트 챌린지", "活动挑战目录", "活動挑戰目錄")],
 ["events/{eventId}/challenges/{challengeId}/ranking", L("Challenge snapshot", "チャレンジスナップショット", "챌린지 스냅샷", "挑战榜快照", "挑戰榜快照")],
 ["announcements/{announcementId}/revisions", L("Announcement revisions", "お知らせの改訂", "공지 이전 버전", "公告历史版本", "公告歷史版本")],
];
const snapshots = snapshotPaths.map(([tail, title], i) => ({
 id: `game.snapshot.${i}`, method: "GET", methods: ["GET", "HEAD"], path: `/api/v1/${tail}`, title,
 description: L("Returns the complete cached game snapshot, retaining collection timestamps, duplicate positions and state fields.", "収集時刻・重複順位・状態を保持したゲームのスナップショットを返します。", "수집 시각·중복 순위·상태 필드를 유지한 전체 게임 스냅샷입니다.", "返回完整游戏快照，保留采集时间、重复名次与状态字段。", "回傳完整遊戲快照，保留採集時間、重複名次與狀態欄位。"),
 auth: "none", cache: "no-store", params: ["region", ...[...tail.matchAll(/\{([^}]+)\}/gu)].map(m => m[1])].map(name => ({ name, in: name === "region" ? "query" : "path", type: "string", required: true, desc: meanings[name] || fallback(name) })),
 example: { request: { path: `/api/v1/${tail.replace(/\{[^}]+\}/gu, "1")}?region=jp` }, response: { status: 200, json: {}, trimmed: true } }, errors,
}));
export default {
 slug: "reference/game",
 title: L("Game API", "ゲーム API", "게임 API", "游戏 API", "遊戲 API"),
 description: L("Profiles, rankings, decks, circles, product rates and game announcements.", "プロフィール、ランキング、編成、サークル、提供割合、お知らせ。", "프로필, 랭킹, 편성, 서클, 상품 확률, 게임 공지.", "玩家资料、排行榜、编队、圈子、商品概率和游戏公告。", "玩家資料、排行榜、編隊、圈子、商品機率與遊戲公告。"),
 intro: L("Use the explicit game region in every URL. Keep 64-bit IDs as decimal strings and distinguish accountId, profileId, songId and challengeId. For stored recruitment pools use the catalog gacha entity; for archived notices use /api/v1/announcements. This page adds the live game contracts and preserves every supplied field. Read the [game API guide](/guides/game-api/) for complete workflows.", "URL ごとにゲーム地域を指定してください。64 ビット ID は十進文字列のまま扱い、accountId、profileId、songId、challengeId を区別します。保存済みガチャ情報はカタログ、保存済みお知らせは /api/v1/announcements を使います。このページではゲームの契約を追加し、取得した全フィールドを保持します。[ゲーム API ガイド](/guides/game-api/)に手順を掲載しています。", "모든 URL에 게임 지역을 지정하세요. 64비트 ID는 십진 문자열로 유지하고 accountId, profileId, songId, challengeId를 구분하세요. 저장된 모집 정보는 카탈로그, 보관된 공지는 /api/v1/announcements를 사용합니다. 이 페이지는 게임 계약을 추가하고 제공된 모든 필드를 보존합니다. [게임 API 안내](/guides/game-api/)에서 전체 흐름을 확인하세요.", "每个 URL 都明确指定游戏区服。64 位 ID 使用十进制字符串，区分 accountId、profileId、songId 和 challengeId。已归档的招募池使用目录 gacha 实体，公告归档使用 /api/v1/announcements。本页补充游戏调用契约，保留返回的全部字段。完整流程见[游戏 API 使用指南](/guides/game-api/)。", "每個 URL 都明確指定遊戲區服。64 位元 ID 使用十進位字串，區分 accountId、profileId、songId 和 challengeId。已封存的招募池使用目錄 gacha 實體，公告封存使用 /api/v1/announcements。本頁補充遊戲呼叫契約，保留回傳的全部欄位。完整流程見[遊戲 API 使用指南](/guides/game-api/)。"),
 sections: [{ title: L("Game resources", "ゲームリソース", "게임 리소스", "游戏资源", "遊戲資源"), endpoints: contract.routes.map((route, i) => ({
  id: `game.${i}`, method: "GET", methods: ["GET", "HEAD"], path: route.path, title: titles[i], auth: "none", cache: "no-store",
  description: titles[i], params: route.parameters.map(p => ({ name: p.name, in: p.in, required: p.required, schema: p.schema, type: p.schema.type === "array" ? "string[]" : p.schema.type || "string", desc: meanings[p.name] || fallback(p.name) })).concat(i === 14 ? [{ name: "revision", in: "query", type: "string", required: false, desc: L("Cached revision from the announcement revision list. Omit for the latest.", "お知らせの版一覧にあるキャッシュ版。省略時は最新。", "공지 버전 목록의 캐시 버전. 생략하면 최신.", "公告版本列表中的缓存版本，省略时读取最新版本。", "公告版本列表中的快取版本，省略時讀取最新版本。") }] : []),
  fields: fieldsFor(route),
  responseSchema: route.responses["200"]?.content?.["application/json"]?.schema,
  ...(i === 3 ? { responseContentType: "image/png" } : {}),
  example: { request: { path: examplePath(route) }, response: { status: 200, ...(i === 3 ? { binary: true } : { json: exampleResponses[i], trimmed: true }) } },
  errors,
 })) }, { title: L("Event snapshots and revisions", "イベントのスナップショットと版", "이벤트 스냅샷·버전", "活动快照与版本", "活動快照與版本"), endpoints: snapshots }],
};
