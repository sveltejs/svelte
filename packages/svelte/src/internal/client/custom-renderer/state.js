/**
 * @import { Renderer } from ".";
 */

/**
 * @type {Renderer | null}
 */
export let renderer = null;

/**
 * @param {Renderer | null} $renderer
 */
export function set_renderer($renderer) {
	renderer = $renderer;
}

/**
 *
 * @param {Renderer} $renderer
 */
export function push_renderer($renderer) {
	let old_renderer = renderer;
	renderer = $renderer;
	return () => {
		renderer = old_renderer;
	};
}
