import * as e from '../internal/shared/errors.js';

/**
 * Server-side stub for `svelte/renderer`. Custom renderers rely on Svelte's
 * client build (the same one selected by the `browser` export condition), which
 * is not available in a server context. Calling `createRenderer` here throws a
 * descriptive error pointing users at the `custom-renderer` resolve condition
 * rather than letting them fail later with a cryptic `mount` error.
 *
 * The parameter mirrors the real `createRenderer` signature so this stub is a
 * drop-in replacement; it is intentionally unused.
 *
 * @param {unknown} [_renderer]
 * @returns {never}
 */
export function createRenderer(_renderer) {
	e.custom_renderer_unavailable_on_server();
}
