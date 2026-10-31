import { demoText } from "../../public/examples/demo-text.js";
/** Small page binding; the SDK itself is imported only by the Run action. */
export function installDataDemos() {
  for (const root of document.querySelectorAll<HTMLElement>("[data-demo-kind]")) {
    if (root.dataset.demoBound) continue;
    root.dataset.demoBound = "pending";
    const bindingUrl = "/examples/data-demo.js";
    void import(/* @vite-ignore */ bindingUrl).then(({ install }) => {
      install(root, { loadClient: () => {
        const moduleUrl = "https://haneoka.org/embed/api-client.js";
        return import(/* @vite-ignore */ moduleUrl);
      } });
      root.dataset.demoBound = "ready";
      for (const button of root.querySelectorAll<HTMLButtonElement>("[data-demo-run], [data-demo-preset]")) button.disabled = false;
      const status = root.querySelector<HTMLElement>("[data-demo-status]");
      if (status) status.textContent = demoText(root.dataset.uiLocale)("Ready to run", "等待操作");
    }).catch((error) => {
      root.dataset.demoBound = "error";
      const status = root.querySelector<HTMLElement>("[data-demo-status]");
      if (status) status.textContent = `${demoText(root.dataset.uiLocale)("Example setup failed; refresh: ", "示例初始化失败，请刷新：")}${error.message}`;
    });
  }
}
