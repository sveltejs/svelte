import { ssr_context } from './context.js';
import { once } from './index.js';

/**
 * @template V
 * @param {() => V} fn
 */
export function derived(fn) {
	if (ssr_context !== null) {
		return once(fn);
	}

	return fn;
}
