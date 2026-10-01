/** Small page binding; the SDK itself is imported only by the Run action. */
export function installDataDemos() {
  for (const root of document.querySelectorAll<HTMLElement>("[data-demo-kind]")) {
    if (root.dataset.demoBound) continue;
    root.dataset.demoBound = "true";
    const bindingUrl = "/examples/data-demo.js";
    void import(/* @vite-ignore */ bindingUrl).then(({ install }) => install(root, { loadClient: () => {
      const moduleUrl = "https://haneoka.org/embed/api-client.js";
      return import(/* @vite-ignore */ moduleUrl);
    } }));
  }
}
