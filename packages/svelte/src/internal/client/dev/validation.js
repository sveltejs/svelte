import { invalid_snippet_arguments } from '../../shared/errors.js';
/**
 * @param {Node} anchor
 * @param {number[]} with_fallback_idx
 * @param {...(()=>any)[]} args
 */
export function validate_snippet_args(anchor, with_fallback_idx, ...args) {
	if (typeof anchor !== 'object' || !(anchor instanceof Node)) {
		invalid_snippet_arguments();
	}
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (typeof arg !== 'function' && !(with_fallback_idx.includes(i) && arg === undefined)) {
			invalid_snippet_arguments();
		}
	}
}
