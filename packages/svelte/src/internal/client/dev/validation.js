import * as e from '../errors.js';
/**
 * @param {Node} anchor
 * @param {...(()=>any)[]} args
 */
export function validate_snippet_args(anchor, ...args) {
	// TODO RENDERER: don't emit validate args for custom renderers
	if (typeof anchor !== 'object' || !(anchor instanceof Node)) {
		e.invalid_snippet_arguments();
	}

	for (let arg of args) {
		if (typeof arg !== 'function') {
			e.invalid_snippet_arguments();
		}
	}
}
