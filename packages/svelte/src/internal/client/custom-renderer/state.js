/**
 * @import { Renderer } from ".";
 */

/**
 * @type {Renderer | null}
 */
let renderer = null;

/**
 *
 * @returns {Renderer | null}
 */
export function get_renderer() {
	return renderer;
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
