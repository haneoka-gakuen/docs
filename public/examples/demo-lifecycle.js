/** One active heavyweight example per document. Each owner supplies SDK disposal. */
let active;
let queue = Promise.resolve();
export function activate(owner) {
  queue = queue.catch(() => {}).then(async () => {
    if (active?.root !== owner.root) await active?.exit();
    active = owner;
  });
  return queue;
}
export function release(root) {
  if (active?.root === root) active = undefined;
}
