/** @import { Derived, Value } from '#client' */
import { DERIVED, WAS_MARKED } from '#client/constants';

/**
 * @param {Value[] | null} deps
 */
export function clear_marked(deps) {
	if (deps === null) return;

	for (const dep of deps) {
		if ((dep.f & DERIVED) === 0 || (dep.f & WAS_MARKED) === 0) {
			continue;
		}

		dep.f ^= WAS_MARKED;

		clear_marked(/** @type {Derived} */ (dep).deps);
	}
}
