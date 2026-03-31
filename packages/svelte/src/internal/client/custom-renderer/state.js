/**
 * @import { Renderer } from ".";
 */

/**
 * @type {Renderer<any, any, any, any> | null}
 */
export let renderer = null;

// to use with $props.id()
export let custom_renderer_window = {};

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
