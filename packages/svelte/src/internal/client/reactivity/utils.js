/** @import { Derived, Effect, Reaction } from '#client' */
import { DERIVED, WAS_MARKED } from '#client/constants';

/**
 * @param {Reaction} reaction
 */
function clear_marked(reaction) {
	if ((reaction.f & WAS_MARKED) === 0) {
		return;
	}

	reaction.f ^= WAS_MARKED;

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
 * @param {Effect} effect
 * @param {Set<Effect>} dirty_effects
 */
export function defer_effect(effect, dirty_effects) {
	dirty_effects.add(effect);

	// Since we're not executing these effects now, we need to clear any WAS_MARKED flags
	// so that other batches can correctly reach these effects during their own traversal
	clear_marked(effect);
}
