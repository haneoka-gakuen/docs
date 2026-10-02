const coreUrl = "https://haneoka.org/embed/core.js";
const exampleBase = new URL("./", import.meta.url).href;
const languages = ["ja", "en", "zh-TW", "zh-CN", "ko"];
const authored = { language: "fr", title: "Une promenade", background: "garden.svg", lines: [{ speaker: "Mira", text: "Bienvenue au jardin." }] };

export function install(root, { loadClient } = {}) {
  const kind = root.dataset.demoKind;
  const zh = root.dataset.uiLocale === "zh-CN";
  const field = (name) => root.querySelector(`[data-demo-${name}]`);
  const editor = field("config");
  const output = field("output");
  const status = field("status");
  let controller;
  let loader;
  let unsubscribe;
  let config;
  let data;
  let generation = 0;
  let entries = [];
  const text = (en, cn) => zh ? cn : en;
  const show = (value) => {
    entries.push(value);
    entries = entries.slice(-32);
    output.textContent = JSON.stringify(entries, (_, value) => value instanceof Error ? {
      name: value.name, message: value.message, code: value.code, status: value.status,
      requestId: value.requestId, retryable: value.retryable,
    } : value, 2).slice(0, 100000);
  };
  const read = () => {
    const value = JSON.parse(editor.value);
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("Parameters must be an object");
    return value;
  };
  const syncLanguage = (value) => {
    const locale = kind === "api" ? value.scope?.locale ?? "en" : value.locale ?? "en";
    field("author-locale").value = locale;
    for (const input of root.querySelectorAll("[data-demo-language]")) input.checked = input.value === locale;
  };
  const write = (value) => { editor.value = JSON.stringify(value, null, 2); syncLanguage(value); };
  const enableResources = (enabled) => {
    for (const name of ["resource-url", "resource-bytes", "dispose"]) {
      const button = field(name); if (button) button.disabled = !enabled;
    }
  };
  const cleanup = async () => {
    controller?.abort();
    const active = loader; loader = undefined;
    enableResources(false);
    await active?.dispose();
    unsubscribe?.(); unsubscribe = undefined;
    field("run").disabled = false; field("cancel").disabled = true;
  };
  const preset = (name) => {
    const locale = field("author-locale").value || (kind === "core" ? "fr" : "en");
    if (kind === "core") {
      const common = { source: name, locale, maxBytes: 1048576, resourceKey: "garden.svg" };
      if (name === "memory") Object.assign(common, { assetsBase: exampleBase, data: authored });
      if (name === "http") common.url = new URL("promenade.json", exampleBase).href;
      if (name === "file") common.data = authored;
      if (name === "haneoka") Object.assign(common, { resource: "songs", id: "100070", server: "intl", resourceField: "jacketUrl" });
      write(common);
    } else {
      const common = { operation: name, resource: "songs", scope: { server: "intl", locale: languages.includes(locale) ? locale : "en" }, client: { baseUrl: "https://haneoka.org/api/v1/" } };
      if (name === "entity") common.id = "100070";
      if (name === "page") common.scope.limit = 1;
      if (name === "batch") common.ids = ["100001", "100070"];
      if (name === "relation") Object.assign(common, { relation: "band", key: "1" });
      if (name === "image") Object.assign(common, { id: "100070", difficulty: "expert", image: { format: "svg", height: 720, download: false } });
      if (["get", "request", "response", "url"].includes(name)) Object.assign(common, { path: "songs/100070", request: { method: name === "response" ? "HEAD" : "GET", query: { server: "intl" } } });
      write(common);
    }
  };
  // The callback is executable example code, with only method/URL/policy logged.
  const transport = async (request) => {
    const outgoing = new Request(request, { referrerPolicy: "no-referrer" });
    show({ request: { method: outgoing.method, url: outgoing.url, credentials: outgoing.credentials, mode: outgoing.mode, referrerPolicy: outgoing.referrerPolicy } });
    const response = await fetch(outgoing);
    show({ response: { status: response.status, contentType: response.headers.get("content-type") } });
    return response;
  };
  for (const button of root.querySelectorAll("[data-demo-preset]")) button.addEventListener("click", () => preset(button.dataset.demoPreset));
  for (const input of root.querySelectorAll("[data-demo-language]")) input.addEventListener("change", () => {
    try { const value = read(); if (kind === "api") value.scope = { ...value.scope, locale: input.value }; else value.locale = input.value; write(value); }
    catch (error) { status.textContent = error.message; }
  });
  field("author-locale").addEventListener("change", () => {
    try { const value = read(); if (kind === "api") value.scope = { ...value.scope, locale: field("author-locale").value }; else value.locale = field("author-locale").value; write(value); }
    catch (error) { status.textContent = error.message; }
  });
  field("cancel").addEventListener("click", () => { controller?.abort(); loader?.cancel(); });
  field("dispose")?.addEventListener("click", async () => {
    generation += 1;
    try { await cleanup(); show({ disposed: true }); status.textContent = text("Disposed", "已销毁"); }
    catch (error) { show(error); status.textContent = error.message; }
  });
  field("run").addEventListener("click", async () => {
    const current = ++generation;
    await cleanup();
    if (current !== generation) return;
    entries = []; output.textContent = "";
    controller = new AbortController();
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]);
    field("run").disabled = true; field("cancel").disabled = false;
    status.textContent = text("Loading…", "正在加载…");
    try {
      config = read(); syncLanguage(config);
      if (kind === "core") {
        const sdk = await import(coreUrl);
        signal.throwIfAborted(); if (current !== generation) return;
        let source;
        if (config.source === "memory") source = sdk.memoryDataSource(config.data);
        else if (config.source === "http") source = sdk.httpDataSource({ url: config.url });
        else if (config.source === "file") source = sdk.fileDataSource(field("file").files[0] ?? new Blob([JSON.stringify(config.data ?? authored)], { type: "application/json" }));
        else if (config.source === "haneoka") source = sdk.haneokaDataSource({ resource: config.resource, ...(config.id === undefined ? {} : { id: config.id }), ...(config.view === undefined ? {} : { view: config.view }), ...(config.apiBase === undefined ? {} : { apiBase: config.apiBase }) });
        else throw new TypeError("Unknown data source");
        const options = { source, locale: config.locale, server: config.server, assetsBase: config.assetsBase, credentials: config.credentials, headers: config.headers, maxBytes: config.maxBytes, fetcher: transport, onListenerError: (error) => show({ observerError: error.message }) };
        if (config.source === "file") {
          const response = await fetch(new URL("garden.svg", exampleBase), { signal });
          if (!response.ok) throw new Error(`Example image HTTP ${response.status}`);
          const blob = await response.blob();
          signal.throwIfAborted();
          options.resolveResource = sdk.fileResourceResolver(new Map([["garden.svg", blob]]));
        }
        loader = sdk.createEmbedLoader(options);
        unsubscribe = loader.subscribe(event => show({ event }));
        field("dispose").disabled = false;
        data = await loader.load({ signal });
        show({ data }); enableResources(true);
      } else {
        if (!loadClient) throw new Error("The documentation client entry is unavailable");
        const sdk = await loadClient();
        signal.throwIfAborted(); if (current !== generation) return;
        const api = sdk.createHaneokaClient({ ...config.client, transport });
        const scope = { ...config.scope, signal };
        if (config.validateMusicId) scope.decode = value => {
          if (!value || typeof value !== "object" || !Number.isInteger(value.musicId)) throw new TypeError("Expected musicId");
          return value;
        };
        let result;
        if (config.operation === "servers") result = await api.servers({ signal });
        else if (config.operation === "index") result = await api.index(config.resource, scope);
        else if (config.operation === "entity") result = await api.entity(config.resource, config.id, scope);
        else if (config.operation === "page") {
          result = await api.page(config.resource, scope);
          if (result.nextCursor) { config.scope.cursor = result.nextCursor; write(config); }
        } else if (config.operation === "batch") result = await api.batch(config.resource, config.ids, scope);
        else if (config.operation === "relation") result = await api.relation(config.resource, config.relation, config.key, scope);
        else if (config.operation === "image") result = api.chartImageUrl(config.id, config.difficulty, { ...config.scope, ...config.image });
        else {
          const general = sdk.createApiClient({ baseUrl: config.client?.baseUrl ?? "https://haneoka.org/api/v1/", headers: config.client?.headers, transport });
          const options = { ...config.request, signal };
          if (!["GET", "HEAD"].includes(options.method ?? "GET")) throw new TypeError("This read demo accepts GET and HEAD");
          if (config.operation === "get") result = await general.get(config.path, options);
          else if (config.operation === "request") result = await general.request(config.path, options);
          else if (config.operation === "url") result = general.url(config.path, config.request?.query);
          else if (config.operation === "response") {
            const response = await general.response(config.path, options);
            result = { status: response.status, headers: Object.fromEntries(response.headers), body: options.method === "HEAD" ? "" : (await response.text()).slice(0, 100000) };
          } else throw new TypeError("Unknown client operation");
        }
        show({ result });
      }
      if (current === generation) status.textContent = text("Complete", "已完成");
    } catch (error) {
      if (current === generation) { show(error); status.textContent = signal.aborted ? text("Cancelled or timed out", "已取消或超时") : error.message; }
    } finally {
      if (current === generation) { field("run").disabled = false; field("cancel").disabled = kind === "core" ? !loader : true; }
    }
  });
  const resource = async (bytes) => {
    const active = loader;
    const current = generation;
    if (!active) return;
    try {
      const latest = read();
      const key = latest.resourceField ? data[latest.resourceField] : latest.resourceKey;
      if (typeof key !== "string" || !key) throw new TypeError("Set resourceKey or a string resourceField");
      const result = bytes ? await active.resourceBytes(key, { signal: AbortSignal.timeout(15000) }) : await active.resourceUrl(key);
      if (active !== loader || current !== generation) return;
      show(bytes ? { bytes: result.length, firstBytes: Array.from(result.slice(0, 16)) } : { url: result });
    } catch (error) { if (active === loader && current === generation) { show(error); status.textContent = error.message; } }
  };
  field("resource-url")?.addEventListener("click", () => resource(false));
  field("resource-bytes")?.addEventListener("click", () => resource(true));
  window.addEventListener("pagehide", () => { generation += 1; void cleanup(); }, { once: true });
  preset(kind === "core" ? "memory" : "entity");
}
