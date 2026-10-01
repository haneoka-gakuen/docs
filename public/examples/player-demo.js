const epoch = "https://haneoka.org/embed/";
const exampleBase = new URL("./", import.meta.url).href;
let active;
let switchQueue = Promise.resolve();
const activate = (next) => {
  switchQueue = switchQueue.catch(() => {}).then(async () => {
    if (active?.root !== next.root) await active?.exit();
    active = next;
  });
  return switchQueue;
};
const ownStory = () => ({ localization: { locales: ["en"], defaultLocale: "en" }, commands: [
  { command: 25, background: { url: "garden.svg" } },
  { command: 2, targetName: "Mira", text: "Welcome to this original garden." },
  { command: 2, targetName: "Mira", text: "Change locale, text, or resource paths in the document." },
  { command: 2, targetName: "Mira", text: "Seek backwards or exit to release the player." },
] });
const ownChart = () => ({ version: 1, bpmChanges: [{ tick: 0, beat: 0, timeMs: 0, bpm: 120 }], signatureChanges: [], timeScaleChanges: [], timeline: { skills: [], fever: [], callChanges: [] }, lines: [], durationMs: 8000, notes: Array.from({ length: 12 }, (_, i) => ({ id: i, tick: i * 240, timeMs: 500 + i * 500, beat: i, pos: i % 6 * 4, size: 4, laneX: (i % 6 * 4 + 2) / 12 - 1, width: 4 / 12, operateType: 1, judgementType: 1, judgementAreaOffsetType: 0, direction: 0, critical: false, judged: true, visible: true, lineIds: [], slideAlong: false, indexInLine: null, easeL: null, easeR: null })) });
const tone = () => {
  const rate = 12000, length = rate * 8;
  const bytes = new ArrayBuffer(44 + length * 2), view = new DataView(bytes);
  const put = (start, value) => { for (let i = 0; i < value.length; i++) view.setUint8(start + i, value.charCodeAt(i)); };
  put(0, "RIFF"); view.setUint32(4, bytes.byteLength - 8, true); put(8, "WAVEfmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true); put(36, "data"); view.setUint32(40, length * 2, true);
  for (let i = 0; i < length; i++) view.setInt16(44 + i * 2, Math.round(Math.sin(i / rate * 2 * Math.PI * 220) * 700), true);
  return new Blob([bytes], { type: "audio/wav" });
};
const authoredRenderer = { create({ element, chart }) {
  const canvas = document.createElement("canvas"), context = canvas.getContext("2d"); element.append(canvas);
  let width = 0, height = 0, ratio = 1;
  return { render(snapshot) {
    const style = getComputedStyle(element);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.fillStyle = style.getPropertyValue("--md-sys-color-surface-container"); context.fillRect(0, 0, width, height);
    context.fillStyle = style.getPropertyValue("--md-sys-color-primary");
    for (const note of chart.notes) {
      const remain = note.timeMs - snapshot.timeMs;
      if (remain >= -100 && remain < 2500) context.fillRect(note.pos / 24 * width, (1 - remain / 2500) * (height - 48), note.size / 24 * width - 3, 12);
    }
    context.fillStyle = style.getPropertyValue("--md-sys-color-on-surface"); context.font = "16px sans-serif"; context.fillText(`Original chart · ${(snapshot.timeMs / 1000).toFixed(1)}s`, 12, 24);
  }, resize(w, h, r) { width = w; height = h; ratio = r; canvas.width = Math.round(w * r); canvas.height = Math.round(h * r); }, laneAtClientPoint(x, y) { const box = canvas.getBoundingClientRect(); return x < box.left || x > box.right || y < box.top || y > box.bottom ? -1 : Math.min(23, (x - box.left) / box.width * 24); }, dispose() { canvas.remove(); } };
} };
export function install(root) {
  const kind = root.dataset.playerKind, zh = root.dataset.uiLocale === "zh-CN";
  const field = name => root.querySelector(`[data-player-${name}]`);
  const stage = field("stage"), status = field("status"), output = field("output");
  let handle, controller, generation = 0, records = [], renderFrame = 0, lastLogAt = 0;
  const text = (en, cn) => zh ? cn : en;
  const read = () => { const value = JSON.parse(field("config").value); if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("Expected a configuration object"); return value; };
  const write = value => { field("config").value = JSON.stringify(value, null, 2); field("locale").value = value.options?.locale ?? "en"; for (const radio of root.querySelectorAll("[data-player-language]")) radio.checked = radio.value === field("locale").value; };
  const controls = ready => { for (const name of ["play", "pause", "next", "seek", "set-options", "set-skin"]) if (field(name)) field(name).disabled = !ready; };
  const show = event => {
    if (event.type === "state" && performance.now() - lastLogAt < 200) return;
    lastLogAt = performance.now(); records.push(event); records = records.slice(-24);
    if (!renderFrame) renderFrame = requestAnimationFrame(() => { renderFrame = 0; output.textContent = JSON.stringify(records, (_, value) => value instanceof Error ? { name: value.name, message: value.message } : value, 2).slice(0, 48000); });
  };
  const exit = async () => {
    generation += 1; controller?.abort(); const current = handle; handle = undefined;
    controls(false); field("cancel").disabled = true; field("dispose").disabled = true; field("run").disabled = false;
    await current?.dispose(); stage.setAttribute("aria-busy", "false"); status.textContent = text("Disposed", "已销毁");
    if (active?.root === root) active = undefined;
  };
  const preset = input => {
    const options = { locale: field("locale").value || "en" };
    const value = { input, options };
    if (input === "author") options.document = kind === "story" ? ownStory() : { chart: ownChart(), audio: "original-tone.wav" };
    if (input === "http") value.url = new URL(kind === "story" ? "story.json" : "chart.json", exampleBase).href;
    if (input === "haneoka") {
      value.publicSource = kind === "story" ? { id: "afterlive_10109" } : { songId: "100070", difficulty: "expert" };
      if (kind === "story") value.cubism = {
        moduleUrl: "https://haneoka.org/cubism-runtime/vega-cubism-web-runtime.mjs?v=17dbf57920551d6c06812e286395c07b6527db5d183f0bdcfeaad373c32f5596",
        runtime: {
          cubismCoreUrl: "https://haneoka.org/Core/live2dcubismcore.js?v=25ae938cb4fe282ce189b357bcc97e603d1e1f7ec78bf04150d401c23cdc792f",
          cubism2CoreUrl: "https://haneoka.org/Core/live2d.min.js?v=e4ea1f18bdd44b65394ffd5a1bab16982e88757d45134d1bd0737c8a6b3ddd08",
          motionSyncCoreUrl: "https://haneoka.org/Core/CRI/live2dcubismmotionsynccore.min.js?v=60e2a8ba9b422a0f8a3d7e066739352e9b903cc1011339984ad922e80a3cd19a",
        },
      };
    }
    if (kind === "story") Object.assign(options, { assetsBase: exampleBase, theme: "portable", brandingCorner: "top-left" });
    else Object.assign(options, { mode: "watch", volume: .3, rate: 1, noteSoundEnabled: false });
    write(value);
  };
  for (const button of root.querySelectorAll("[data-player-preset]")) button.addEventListener("click", () => preset(button.dataset.playerPreset));
  for (const radio of root.querySelectorAll("[data-player-language]")) radio.addEventListener("change", () => { const value = read(); value.options.locale = radio.value; write(value); });
  field("locale").addEventListener("change", () => { const value = read(); value.options.locale = field("locale").value; write(value); });
  field("dispose").addEventListener("click", () => { void exit().catch(error => { status.textContent = error.message; }); });
  field("cancel").addEventListener("click", () => { controller?.abort(); handle?.cancel(); });
  field("run").addEventListener("click", async () => {
    await exit(); const current = ++generation; controller = new AbortController();
    field("run").disabled = true; field("cancel").disabled = false; field("dispose").disabled = false; controls(false);
    stage.setAttribute("aria-busy", "true"); records = []; output.textContent = ""; status.textContent = text("Loading…", "正在加载…");
    const loadingController = controller;
    const signal = loadingController.signal;
    const deadline = setTimeout(() => loadingController.abort(new DOMException("Demo loading deadline", "TimeoutError")), 45000);
    try {
      await activate({ root, exit }); signal.throwIfAborted(); if (current !== generation) return;
      const config = read();
      const [core, sdk] = await Promise.all([import(`${epoch}core.js`), import(`${epoch}${kind === "story" ? "vega" : "cassiopeia"}.js`)]);
      signal.throwIfAborted(); if (current !== generation) return;
      const options = { ...config.options, signal, onEvent(event) { if (current === generation) show(event); } };
      if (config.input !== "author") delete options.document;
      if (config.input === "http") options.source = core.httpDataSource({ url: config.url });
      else if (config.input === "file") { const file = field("file").files[0]; if (!file) throw new Error(text("Choose a JSON file", "请选择 JSON 文件")); options.source = core.fileDataSource(file); }
      else if (config.input === "haneoka") options.source = kind === "story" ? sdk.haneokaStorySource(config.publicSource) : sdk.haneokaChartSource(config.publicSource);
      else if (config.input !== "author") throw new TypeError("Unknown input");
      if (kind === "story") {
        if (options.theme === "haneoka") { const theme = await import(`${epoch}vega-theme.js`); options.plugins = theme.haneokaStoryPlugins; signal.throwIfAborted(); }
        if (config.cubism) options.plugins = [...(options.plugins ?? []), sdk.cubismStoryPlugin(config.cubism)];
        options.fetcher = request => fetch(new Request(request, { referrerPolicy: "no-referrer" }));
        handle = sdk.mountStory(stage, options);
      } else {
        const blob = tone();
        options.resolveResource = key => key === "original-tone.wav" ? blob : key;
        if (config.input === "author" && options.assetsBase === undefined) options.assetsBase = exampleBase;
        if (config.input === "haneoka" || config.nativeTheme) options.theme = sdk.haneokaChartTheme(config.nativeTheme ?? {});
        else options.rendererAdapter = authoredRenderer;
        handle = sdk.mountChart(stage, options);
      }
      await handle.ready; signal.throwIfAborted(); if (current !== generation) return;
      controls(true); stage.setAttribute("aria-busy", "false"); status.textContent = text("Ready — press Play", "已就绪，请点击播放");
      if (kind === "chart" && !options.theme) field("set-skin").disabled = true;
    } catch (error) {
      if (current === generation) { const failed = handle; handle = undefined; await failed?.dispose().catch(() => {}); if (current !== generation) return; controls(false); stage.setAttribute("aria-busy", "false"); status.textContent = error.message; show({ type: "error", error }); }
    } finally {
      clearTimeout(deadline); if (current === generation) { field("run").disabled = false; field("cancel").disabled = true; }
    }
  });
  const action = async (name, operation) => {
    const player = handle, current = generation;
    try {
      if (!player) throw new Error("Load a player first");
      await operation(player);
      if (player === handle && current === generation) show({ action: name, snapshot: player.snapshot });
    } catch (error) {
      if (current === generation) { status.textContent = error.message; show({ type: "error", error }); }
    }
  };
  field("play").addEventListener("click", () => { void action("play", player => player.play()); });
  field("pause").addEventListener("click", () => { void action("pause", player => player.pause()); });
  field("next")?.addEventListener("click", () => { void action("next", player => player.next()); });
  field("seek").addEventListener("click", () => { void action("seek", player => player.seek(Number(field("seek-value").value))); });
  field("set-options")?.addEventListener("click", () => { void action("setOptions", player => player.setOptions(JSON.parse(field("options").value))); });
  field("set-skin")?.addEventListener("click", () => { void action("setSkin", player => player.setSkin(JSON.parse(field("skin").value))); });
  window.addEventListener("pagehide", () => { void exit().catch(() => {}); cancelAnimationFrame(renderFrame); }, { once: true });
  preset("author");
}
