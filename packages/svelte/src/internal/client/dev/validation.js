import { invalid_snippet_arguments } from '../../shared/errors.js';
/**
 * @param {Node} anchor
 * @param {...(()=>any)[]} args
 */
export function validate_snippet_args(anchor, ...args) {
	if (typeof anchor !== 'object' || !(anchor instanceof Node)) {
		invalid_snippet_arguments();
	}
	for (let arg of args) {
		if (typeof arg !== 'function') {
			invalid_snippet_arguments();
		}
	}
}
