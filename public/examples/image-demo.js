export function install(root) {
  const field = name => root.querySelector(`[data-image-${name}]`);
  const zh = root.dataset.uiLocale === "zh-CN";
  const text = (en, cn) => zh ? cn : en;
  const editor = field("config"), preview = field("preview"), status = field("status"), output = field("output");
  let controller, generation = 0, blobUrl, etag;
  const read = () => { const value = JSON.parse(editor.value); if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("Expected request options"); return value; };
  const write = value => { editor.value = JSON.stringify(value, null, 2); for (const radio of root.querySelectorAll("[data-image-language]")) radio.checked = radio.value === value.locale; };
  const clear = () => { if (blobUrl) URL.revokeObjectURL(blobUrl); blobUrl = undefined; preview.removeAttribute("src"); preview.hidden = true; field("download").hidden = true; field("download").removeAttribute("href"); };
  for (const button of root.querySelectorAll("[data-image-preset]")) button.addEventListener("click", () => {
    const value = read(), kind = button.dataset.imagePreset;
    value.method = kind === "head" ? "HEAD" : kind === "options" ? "OPTIONS" : "GET";
    if (kind === "svg" || kind === "png") value.format = kind;
    write(value);
  });
  for (const radio of root.querySelectorAll("[data-image-language]")) radio.addEventListener("change", () => { const value = read(); value.locale = radio.value; write(value); });
  field("cancel").addEventListener("click", () => controller?.abort());
  field("clear").addEventListener("click", () => { generation += 1; controller?.abort(); clear(); field("run").disabled = false; field("cancel").disabled = true; field("stage").setAttribute("aria-busy", "false"); status.textContent = text("Preview cleared", "预览已清理"); });
  field("run").addEventListener("click", async () => {
    const current = ++generation; controller?.abort(); controller = new AbortController(); clear();
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]);
    field("run").disabled = true; field("cancel").disabled = false; status.textContent = text("Requesting…", "正在请求…"); field("stage").setAttribute("aria-busy", "true");
    try {
      const config = read();
      const method = config.method ?? "GET";
      if (!["GET", "HEAD", "OPTIONS"].includes(method)) throw new TypeError("This image demo uses GET, HEAD or OPTIONS");
      const base = new URL(config.apiBase ?? "https://haneoka.org/api/v1/");
      if (!base.pathname.endsWith("/")) base.pathname += "/";
      const part = value => encodeURIComponent(String(value));
      const path = `${config.scoped ? `servers/${part(config.server ?? "intl")}/` : ""}songs/${part(config.songId)}/charts/${part(config.difficulty)}/image.${part(config.format ?? "svg")}`;
      const url = new URL(path, base);
      if (!config.scoped && config.server !== undefined) url.searchParams.set("server", config.server);
      for (const key of ["locale", "height", "download", "release"]) if (config[key] !== undefined) url.searchParams.set(key, String(config[key]));
      const headers = new Headers();
      if (config.acceptLanguage) headers.set("Accept-Language", config.acceptLanguage);
      if (config.ifNoneMatch) headers.set("If-None-Match", config.ifNoneMatch === "$last" ? etag ?? "" : config.ifNoneMatch);
      const response = await fetch(url, { method, headers, signal, mode: "cors", credentials: "omit", referrerPolicy: "no-referrer" });
      if (current !== generation) return;
      const result = { request: { method, url: url.href }, status: response.status, headers: Object.fromEntries(response.headers) };
      if (response.headers.get("etag")) etag = response.headers.get("etag");
      if (!response.ok && response.status !== 304) { result.body = method === "HEAD" ? "" : (await response.text()).slice(0, 8000); status.textContent = `${response.status} ${response.statusText}`; }
      else if (method === "GET" && response.status !== 304) {
        const blob = await response.blob(); signal.throwIfAborted(); if (current !== generation) return;
        result.bytes = blob.size;
        if (!blob.type.startsWith("image/")) throw new TypeError(`Expected an image, received ${blob.type}`);
        blobUrl = URL.createObjectURL(blob); preview.src = blobUrl; preview.hidden = false;
        await preview.decode(); signal.throwIfAborted(); if (current !== generation) return;
        const width = Number(response.headers.get("X-Haneoka-Image-Width")) || preview.naturalWidth, height = Number(response.headers.get("X-Haneoka-Image-Height")) || preview.naturalHeight;
        if (width > 0 && height > 0) { preview.width = width; preview.height = height; }
        field("download").href = blobUrl; field("download").download = `chart-${config.songId}-${config.difficulty}.${config.format ?? "svg"}`; field("download").hidden = false;
        status.textContent = `${response.status} · ${width}×${height} · ${blob.size} bytes`;
      } else status.textContent = `${response.status} · ${text("Headers only", "仅响应头")}`;
      output.textContent = JSON.stringify(result, null, 2);
    } catch (error) { if (current === generation) { status.textContent = signal.aborted ? text("Cancelled or timed out", "已取消或超时") : error.message; output.textContent = JSON.stringify({ name: error.name, message: error.message }, null, 2); } }
    finally { if (current === generation) { field("run").disabled = false; field("cancel").disabled = true; field("stage").setAttribute("aria-busy", "false"); } }
  });
  window.addEventListener("pagehide", () => { generation += 1; controller?.abort(); clear(); }, { once: true });
  write(read());
}
