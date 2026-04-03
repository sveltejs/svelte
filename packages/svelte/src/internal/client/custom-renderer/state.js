/**
 * @import { Renderer } from ".";
 */

/**
 * @type {Renderer<any, any, any, any> | null}
 */
export let renderer = null;

// allow for a "window" for each custom renderer...to use with `$props.id`
export let custom_renderer_window_map = new WeakMap();

/**
 * @param {Renderer<any, any, any, any> | null} $renderer
 */
export function set_renderer($renderer) {
	renderer = $renderer;
}

/**
 *
 * @param {Renderer<any, any, any, any>} $renderer
 */
export function push_renderer($renderer) {
	let old_renderer = renderer;
	renderer = $renderer;
	return () => {
		renderer = old_renderer;
	};
}

/**
 * Push a renderer only if no renderer is currently active.
 * Used by compiled components — if render() already pushed a renderer,
 * the component should use that one rather than overriding with its own import.
 * @param {Renderer<any, any, any, any>} $renderer
 * @returns {(() => void) | null}
 */
export function push_renderer_if_inactive($renderer) {
	if (renderer !== null) return null;
	return push_renderer($renderer);
}

/**
 * @template T
 * @param {() => T} fn
 * @returns {T}
 */
export function without_renderer(fn) {
	if (renderer === null) return fn();
	let old_renderer = renderer;
	renderer = null;
	try {
		return fn();
	} finally {
		renderer = old_renderer;
	}
}
