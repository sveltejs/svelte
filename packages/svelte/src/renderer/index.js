export { createRenderer } from '../internal/client/custom-renderer/index.js';
// Custom renderers run "client" rendering outside the browser (terminals,
// tests, native targets), where the package's `browser` condition never
// applies and `svelte` resolves to the server entry whose mount() throws.
// Re-export mount/unmount here so non-DOM hosts can reach them.
export { mount, unmount } from '../internal/client/render.js';
