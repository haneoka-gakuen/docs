import { activate, release } from "./demo-lifecycle.js";
const sdkBase = "https://haneoka.org/embed/";
const assetsBase = new URL("./home-spot/", import.meta.url).href;
export function install(root) {
  const field = name => root.querySelector(`[data-spot-${name}]`);
  const zh = root.dataset.uiLocale === "zh-CN";
  const text = (en, cn) => zh ? cn : en;
  const editor = field("config"), output = field("output"), status = field("status"), stage = field("stage");
  const initial = JSON.parse(editor.value).options.document;
  let handle, controller, generation = 0, exportUrl, records = [], availableCharacters = [];
  const read = () => { const value = JSON.parse(editor.value); if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("Expected a configuration object"); return value; };
  const write = value => { editor.value = JSON.stringify(value, null, 2); field("locale").value = value.options.locale; for (const radio of root.querySelectorAll("[data-spot-language]")) radio.checked = radio.value === value.options.locale; };
  const show = value => { records.push(value); records = records.slice(-24); output.textContent = JSON.stringify(records, (_, value) => value instanceof Error ? { name: value.name, message: value.message } : value, 2).slice(0, 48000); };
  const controls = ready => { for (const name of ["select", "replay", "replace", "resize", "export"]) field(name).disabled = !ready; };
  const renderCharacters = () => {
    const ids = new Map();
    for (const layer of handle?.document?.layers ?? []) if (Number(layer.characterId) > 0 && !ids.has(Number(layer.characterId))) ids.set(Number(layer.characterId), String(layer.key ?? layer.characterId));
    availableCharacters = [...ids.keys()];
    if (!availableCharacters.includes(Number(field("selection").value))) field("selection").value = "0";
    handle.update({ selectedCharacterId: Number(field("selection").value) });
    const group = field("characters"); group.replaceChildren();
    for (const [id, label] of [[0, text("Clear selection", "取消选择")], ...ids]) {
      const button = document.createElement("button"); button.type = "button"; button.textContent = label;
      button.addEventListener("click", () => { field("selection").value = String(id); void action("update", player => player.update({ selectedCharacterId: id })); });
      group.append(button);
    }
  };
  const clearExport = () => { if (exportUrl) URL.revokeObjectURL(exportUrl); exportUrl = undefined; field("download").hidden = true; field("download").removeAttribute("href"); };
  const exit = async () => {
    generation += 1; controller?.abort(); const owned = handle; handle = undefined; clearExport(); controls(false);
    field("run").disabled = false; field("cancel").disabled = true; field("exit").disabled = true;
    await owned?.dispose(); field("characters").replaceChildren(); availableCharacters = []; release(root); stage.setAttribute("aria-busy", "false"); status.textContent = text("Disposed", "已销毁");
  };
  const preset = input => {
    const options = { locale: field("locale").value || "fr", ariaLabel: text("Original scene", "原创场景") };
    const value = { input, options };
    if (input === "author") Object.assign(options, { document: structuredClone(initial), assetsBase });
    if (input === "http") value.url = new URL("scene.json", assetsBase).href;
    if (input === "haneoka") Object.assign(options, { spotId: "40002", server: "intl" });
    write(value);
  };
  async function input(config, core, signal) {
    if (config.input === "author") return { document: config.options.document };
    if (config.input === "http") return { source: core.httpDataSource({ url: config.url }) };
    if (config.input !== "file") throw new TypeError("Expected author, http or file input");
    const file = field("file").files[0] ?? new Blob([JSON.stringify(initial)], { type: "application/json" });
    const selected = field("folder").files;
    const files = new Map();
    if (selected.length) for (const resource of selected) {
      const key = resource.webkitRelativePath ? resource.webkitRelativePath.split("/").slice(1).join("/") : resource.name;
      files.set(key, resource);
    } else for (const key of ["pièce.glb", "人物/acteur.atlas", "人物/acteur.json", "人物/acteur.png"]) {
      const response = await fetch(new URL(key, assetsBase), { signal });
      if (!response.ok) throw new Error(`Example asset HTTP ${response.status}`);
      files.set(key, await response.blob());
    }
    return { source: core.fileDataSource(file), resolveResource: core.fileResourceResolver(files) };
  }
  for (const button of root.querySelectorAll("[data-spot-preset]")) button.addEventListener("click", () => preset(button.dataset.spotPreset));
  for (const radio of root.querySelectorAll("[data-spot-language]")) radio.addEventListener("change", () => { const value = read(); value.options.locale = radio.value; write(value); });
  field("locale").addEventListener("change", () => { const value = read(); value.options.locale = field("locale").value; write(value); });
  field("exit").addEventListener("click", () => { void exit().catch(error => { status.textContent = error.message; }); });
  field("cancel").addEventListener("click", () => handle ? handle.cancel() : controller?.abort());
  field("run").addEventListener("click", async () => {
    await exit(); const current = ++generation; controller = new AbortController(); const loadingController = controller;
    const signal = controller.signal; records = []; output.textContent = ""; field("run").disabled = true; field("cancel").disabled = false; field("exit").disabled = false;
    status.textContent = text("Loading…", "正在加载…"); stage.setAttribute("aria-busy", "true");
    const timer = setTimeout(() => loadingController.abort(new DOMException("Scene demo deadline", "TimeoutError")), 45000);
    try {
      await activate({ root, exit }); signal.throwIfAborted(); if (current !== generation) return;
      const config = read();
      const selectedBase = new URL(config.sdkBase ?? sdkBase);
      if (!/^https?:$/.test(selectedBase.protocol) || selectedBase.search || selectedBase.hash) throw new TypeError("sdkBase must be an absolute HTTP(S) directory");
      if (!selectedBase.pathname.endsWith("/")) selectedBase.pathname += "/";
      const moduleBase = selectedBase.href;
      const [core, sdk] = await Promise.all([import(`${moduleBase}core.js`), import(`${moduleBase}home-spot.js`)]);
      signal.throwIfAborted(); if (current !== generation) return;
      const options = { ...config.options, signal, onEvent(event) { if (current === generation) show({ event }); } };
      if (config.input === "haneoka") handle = sdk.mountHaneokaHomeSpot(stage, options);
      else { delete options.document; Object.assign(options, await input(config, core, signal)); signal.throwIfAborted(); handle = sdk.mountHomeSpot(stage, options); }
      await handle.ready; signal.throwIfAborted(); if (current !== generation) return;
      renderCharacters(); controls(true); status.textContent = text("Ready", "已就绪"); stage.setAttribute("aria-busy", "false");
    } catch (error) {
      if (current === generation) { const failed = handle; handle = undefined; await failed?.dispose().catch(() => {}); if (current !== generation) return; controls(false); stage.setAttribute("aria-busy", "false"); status.textContent = error.message; show({ error }); }
    } finally { clearTimeout(timer); if (current === generation) { field("run").disabled = false; field("cancel").disabled = true; } }
  });
  const action = async (name, operation) => {
    const current = generation, player = handle;
    try { if (!player) throw new Error("Load a scene first"); const result = await operation(player); if (current === generation && player === handle) show({ action: name, state: player.state, result }); }
    catch (error) { if (current === generation) { show({ error }); status.textContent = error.message; } }
  };
  field("select").addEventListener("click", () => { void action("update", player => {
    const id = Number(field("selection").value);
    if (id !== 0 && !availableCharacters.includes(id)) throw new Error(text("Choose a character shown above", "请选择上面列出的场景角色"));
    player.update({ selectedCharacterId: id });
  }); });
  field("replay").addEventListener("click", () => { void action("replay", player => player.replay()); });
  field("resize").addEventListener("click", () => { void action("resize", player => player.resize()); });
  field("replace").addEventListener("click", () => { void action("load", async player => {
    const config = read(), moduleBase = new URL(config.sdkBase ?? sdkBase).href.replace(/\/?$/, "/"), core = await import(`${moduleBase}core.js`);
    const next = config.input === "haneoka" ? { source: (await import(`${moduleBase}home-spot.js`)).haneokaHomeSpotSource(config.options) } : await input(config, core, controller.signal);
    if (next.resolveResource) throw new Error(text("Use Load to apply a new file resource mapping", "文件映射变更请使用加载按钮"));
    await player.load(next); renderCharacters();
  }); });
  field("export").addEventListener("click", () => { void action("exportPng", async player => {
    const current = generation;
    const blob = await player.exportPng(JSON.parse(field("export-options").value));
    if (current !== generation || player !== handle) return;
    clearExport(); exportUrl = URL.createObjectURL(blob); field("download").href = exportUrl; field("download").hidden = false;
    return { bytes: blob.size, mime: blob.type };
  }); });
  window.addEventListener("pagehide", () => { void exit().catch(() => {}); }, { once: true });
  preset("author");
}
