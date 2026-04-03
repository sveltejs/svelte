/** @import { Derived, Effect, Reaction } from '#client' */
import { DERIVED, WAS_MARKED } from '#client/constants';

/**
 * @param {Reaction} reaction
 */
export function clear_marked(reaction) {
	if ((reaction.f & WAS_MARKED) === 0) {
		return;
	}

	unmark(reaction);

	var deps = reaction.deps;
	if (deps !== null) {
		for (var dep of deps) {
			if ((dep.f & DERIVED) !== 0) {
				clear_marked(/** @type {Derived} */ (dep));
			}
		}
	}
}

/**
 * @param {Reaction} reaction
 */
export function mark(reaction) {
	reaction.f |= WAS_MARKED;
}

/**
 * @param {Reaction} reaction
 */
export function unmark(reaction) {
	reaction.f &= ~WAS_MARKED;
}
