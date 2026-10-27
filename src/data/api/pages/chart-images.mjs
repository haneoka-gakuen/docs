import { L } from "../i18n.mjs";
import { P } from "../params.mjs";

const params = [
  P.release,
  { name: "timeZone", in: "query", type: "string", default: "Asia/Tokyo", desc: L("IANA time zone for release dates. Use your browser time zone to match its download.", "公開日の IANA タイムゾーン。ブラウザーと揃えるには同じゾーンを指定。", "공개 시각의 IANA 시간대. 브라우저 다운로드와 맞추려면 같은 시간대를 지정하세요.", "发布时间的 IANA 时区；与网页下载对照时传入浏览器时区。", "發布時間的 IANA 時區；與網頁下載比對時傳入瀏覽器時區。") },
  { name: "songId", in: "path", type: "string", required: true, desc: L("Song ID (`musicId`) from the `songs` resource.", "`songs` リソースの楽曲 ID（`musicId`）。", "`songs` 리소스의 곡 ID(`musicId`).", "`songs` 资源中的歌曲 ID（`musicId`）。", "`songs` 資源中的歌曲 ID（`musicId`）。") },
  { name: "difficulty", in: "path", type: "string", schema: { type: "string", enum: ["easy", "normal", "hard", "expert", "special", "master"] }, required: true, desc: L("`easy`, `normal`, `hard`, `expert`, `special` or `master` — must exist in the song's `difficulty[].difficultyName`.", "`easy`、`normal`、`hard`、`expert`、`special`、`master` のいずれかで、楽曲の `difficulty[].difficultyName` に存在するもの。", "`easy`, `normal`, `hard`, `expert`, `special`, `master` 중 곡의 `difficulty[].difficultyName`에 있는 값.", "`easy`、`normal`、`hard`、`expert`、`special` 或 `master`，且须存在于歌曲的 `difficulty[].difficultyName` 中。", "`easy`、`normal`、`hard`、`expert`、`special` 或 `master`，且須存在於歌曲的 `difficulty[].difficultyName` 中。") },
  { name: "format", in: "path", type: "string", schema: { type: "string", enum: ["png", "svg"] }, required: true, desc: L("Native `png`, or `svg` embedding the same PNG.", "原生 PNG、または同じ PNG を内包する SVG。", "원본 소재 PNG 또는 같은 PNG를 포함한 SVG.", "原生素材 PNG，或内嵌同一 PNG 的 SVG。", "原生素材 PNG，或內嵌同一 PNG 的 SVG。") },
  { name: "locale", in: "query", type: "string", required: false, desc: L("Language of the title and band name: `ja`, `en`, `zh-TW`, `zh-CN` or `ko`. Defaults to the `Accept-Language` negotiation.", "タイトルとバンド名の言語：`ja`、`en`、`zh-TW`、`zh-CN`、`ko`。既定は `Accept-Language` による判定。", "제목과 밴드 이름의 언어: `ja`, `en`, `zh-TW`, `zh-CN`, `ko`. 기본값은 `Accept-Language` 협상.", "标题与乐队名的语言：`ja`、`en`、`zh-TW`、`zh-CN` 或 `ko`。默认按 `Accept-Language` 协商。", "標題與樂團名稱的語言：`ja`、`en`、`zh-TW`、`zh-CN` 或 `ko`。預設依 `Accept-Language` 協商。") },
  { name: "height", in: "query", type: "integer", schema: { type: "integer", minimum: 360, maximum: 1440 }, required: false, default: 720, desc: L("Height of each chart column in pixels, 360–1440. The finished image is taller because it adds a header; read `X-Haneoka-Image-Width` / `-Height`.", "譜面列の高さ（px、360〜1440）。ヘッダーが加わるため完成画像はより高くなります。`X-Haneoka-Image-Width`／`-Height` を参照してください。", "채보 열의 높이(px, 360~1440). 헤더가 더해져 최종 이미지는 더 높습니다. `X-Haneoka-Image-Width`/`-Height`를 확인하세요.", "每列谱面的高度（像素，360–1440）。成图会加上标题栏而更高，请读取 `X-Haneoka-Image-Width` / `-Height`。", "每欄譜面的高度（像素，360–1440）。成圖會加上標題列而更高，請讀取 `X-Haneoka-Image-Width` / `-Height`。") },
  { name: "download", in: "query", type: "string", required: false, default: "1", desc: L("`1` sends `Content-Disposition: attachment`; `0` sends `inline` so the image can be shown in a browser tab or `<img>`.", "`1` は `Content-Disposition: attachment`、`0` は `inline` で、ブラウザーのタブや `<img>` で表示できます。", "`1`은 `Content-Disposition: attachment`, `0`은 `inline`이라 브라우저 탭이나 `<img>`에서 보여 줄 수 있습니다.", "`1` 发送 `Content-Disposition: attachment`；`0` 发送 `inline`，可在浏览器标签页或 `<img>` 中显示。", "`1` 傳送 `Content-Disposition: attachment`；`0` 傳送 `inline`，可在瀏覽器分頁或 `<img>` 中顯示。") },
];
const errors = [
  "format_not_supported", "server_not_found", "song_not_found", "difficulty_not_found", "chart_not_found",
  { code: "invalid_time_zone", status: 400, desc: L("Use a valid IANA time zone.", "有効な IANA タイムゾーンを指定。", "유효한 IANA 시간대를 사용하세요.", "使用有效的 IANA 时区。", "使用有效的 IANA 時區。") }, "invalid_height", "invalid_download", "invalid_locale", "invalid_server", "invalid_release", "release_not_found", "body_not_allowed",
  "chart_too_large", "chart_render_budget", "release_unavailable", "chart_invalid", "chart_path_invalid",
  { code: "native_renderer_unavailable", status: 503, desc: L("The native image service is unavailable. Use the device-side renderChartImage module.", "原生画像サービスを利用できません。端末の renderChartImage を使用できます。", "원본 이미지 서비스를 사용할 수 없습니다. 기기의 renderChartImage 모듈을 사용할 수 있습니다.", "原生图片服务暂时不可用，可使用设备上的 renderChartImage 模块。", "原生圖片服務暫時無法使用，可使用裝置上的 renderChartImage 模組。") }, "png_invalid", "chart_image_failed", "HTTP_304",
];
const headers = {
  "Content-Type": "image/svg+xml; charset=utf-8",
  "Content-Disposition": "inline; filename=\"Haneoka-intl-100001-expert-en.svg\"",
  "Content-Language": "en",
  "Cache-Control": "public, max-age=300, must-revalidate",
  ETag: "\"intl:r-8da1a1f914879ac54d8a:100001:en:expert:chart-overview-native-v3:452c560d…\"",
  "X-Haneoka-Chart-Renderer": "chart-overview-native-v3",
  "X-Haneoka-Image-Width": "5360",
  "X-Haneoka-Image-Height": "2144",
  "X-Haneoka-Release-Id": "r-8da1a1f914879ac54d8a",
  "X-Haneoka-Server": "intl",
};
const svg = `<svg xmlns="http://www.w3.org/2000/svg" lang="en" width="5360" height="2144" viewBox="0 0 5360 2144">
<image width="5360" height="2144" href="data:image/png;base64,…"/>
</svg>`;

export default {
  slug: "reference/chart-images",
  title: L("Chart images", "譜面画像", "채보 이미지", "谱面图片", "譜面圖片"),
  description: L(
    "Render any chart of the current release as a shareable SVG or PNG overview.",
    "現在のリリースの譜面を、共有しやすい SVG または PNG の全体図として描画します。",
    "현재 릴리스의 채보를 공유하기 좋은 SVG 또는 PNG 개요 이미지로 렌더링합니다.",
    "把当前版本的任意谱面渲染为便于分享的 SVG 或 PNG 总览图。",
    "把目前版本的任意譜面繪製為便於分享的 SVG 或 PNG 總覽圖。",
  ),
  intro: L(
    "Uses the same native note atlas, ribbons, jacket, icons, fonts and image layout as the website download. Pin a release for reproducible inputs. PNG is rendered by a browser service; SVG contains that same PNG. The complete chart is arranged in columns. Device-side export is available in the [local computation guide](/guides/local-computation/). ETag revalidation includes the release, image options and content hash.",
    "サイトのダウンロードと同じ音符アトラス、スライド、ジャケット、アイコン、フォント、レイアウトを使います。入力を固定するには release を指定します。ブラウザーサービスで PNG を生成し、SVG には同じ PNG を内包します。譜面全体を列に配置します。端末での出力は[ローカル計算](/guides/local-computation/)を参照してください。ETag には release、画像設定、内容ハッシュが入ります。",
    "사이트 다운로드와 같은 음표 아틀라스·슬라이드·재킷·아이콘·글꼴·레이아웃을 사용합니다. release를 고정하면 입력을 재현할 수 있습니다. 브라우저 서비스에서 PNG를 생성하고 SVG에는 같은 PNG를 넣습니다. 전체 채보를 열로 배치합니다. 기기 내보내기는 [로컬 계산](/guides/local-computation/)을 확인하세요. ETag에는 release·이미지 옵션·내용 해시가 포함됩니다.",
    "与网页下载共用原生音符图集、滑条、封面、图标、字体与图片排版。固定 release 可复现输入；浏览器服务生成 PNG，SVG 内嵌同一 PNG。整张谱面分栏排布。设备端导出见[本地计算指南](/guides/local-computation/)。ETag 包含版本、图片选项与内容哈希。",
    "與網頁下載共用原生音符圖集、滑條、封面、圖示、字型與圖片排版。固定 release 可重現輸入；瀏覽器服務產生 PNG，SVG 內嵌相同 PNG。整張譜面分欄排列。裝置端匯出見[本機計算指南](/guides/local-computation/)。ETag 包含版本、圖片選項與內容雜湊。",
  ),
  sections: [
    {
      title: L("Render a chart", "譜面の描画", "채보 렌더링", "渲染谱面", "繪製譜面"),
      endpoints: [
        {
          id: "chart-images.alias",
          method: "GET",
          methods: ["GET", "HEAD"],
          path: "/api/v1/songs/{songId}/charts/{difficulty}/image.{format}",
          title: L("Render a chart image", "譜面画像の描画", "채보 이미지 렌더링", "渲染谱面图片", "繪製譜面圖片"),
          description: L(
            "Short form that selects the server with `?server=` (default `intl`). Behaves exactly like the scoped route below.",
            "`?server=`（既定 `intl`）でサーバーを選ぶ短縮形です。下のスコープ形とまったく同じ動作です。",
            "`?server=`(기본 `intl`)로 서버를 고르는 단축형입니다. 아래 범위형과 똑같이 동작합니다.",
            "用 `?server=`（默认 `intl`）选择服务器的简写形式，行为与下方限定形式完全相同。",
            "用 `?server=`（預設 `intl`）選擇伺服器的簡寫形式，行為與下方限定形式完全相同。",
          ),
          responseContentTypes: ["image/png", "image/svg+xml"],
          auth: "none",
          cache: "public, max-age=300, must-revalidate",
          params: [...params, P.serverQuery],
          example: {
            request: { path: "/api/v1/songs/100001/charts/expert/image.svg?locale=en&download=0" },
            response: { status: 200, headers, text: svg, lang: "xml", trimmed: true },
          },
          errors,
        },
        {
          id: "chart-images.scoped",
          method: "GET",
          methods: ["GET", "HEAD"],
          path: "/api/v1/servers/{server}/songs/{songId}/charts/{difficulty}/image.{format}",
          title: L("Render a chart image for a server", "サーバーを指定した譜面画像の描画", "서버를 지정해 채보 이미지 렌더링", "按服务器渲染谱面图片", "依伺服器繪製譜面圖片"),
          description: L(
            "Scoped form. A `server` query parameter, if sent, must equal the path value. Requests must not carry a body.",
            "スコープ形です。`server` クエリを送る場合はパスの値と同じでなければなりません。リクエストに本文は付けられません。",
            "범위형입니다. `server` 쿼리를 보내면 경로 값과 같아야 합니다. 요청에 본문을 넣을 수 없습니다.",
            "限定形式。如发送 `server` 查询参数，必须与路径中的值相同。请求不能带请求体。",
            "限定形式。如傳送 `server` 查詢參數，必須與路徑中的值相同。請求不能帶請求主體。",
          ),
          responseContentTypes: ["image/png", "image/svg+xml"],
          auth: "none",
          cache: "public, max-age=300, must-revalidate",
          params: [P.server, ...params],
          example: {
            request: { path: "/api/v1/servers/jp/songs/100001/charts/expert/image.png?height=540&locale=ja", binary: true },
            response: { status: 200, binary: true, headers: { "Content-Type": "image/png", "Content-Disposition": "attachment; filename=\"Haneoka-jp-100001-expert-ja.png\"", "X-Haneoka-Server": "jp" } },
          },
          errors,
        },
      ],
    },
  ],
};
