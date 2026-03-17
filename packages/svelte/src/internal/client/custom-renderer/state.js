/**
 * @type {any}
 */
let renderer = null;

export function get_renderer() {
	return renderer;
}

/**
 *
 * @param {any} $renderer
 */
export function push_renderer($renderer) {
	let old_renderer = renderer;
	renderer = $renderer;
	return () => {
		renderer = old_renderer;
	};
}