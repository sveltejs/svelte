/** @import { Derived, Effect, Reaction, Value } from '#client' */
import { CLEAN, DERIVED, DIRTY, MAYBE_DIRTY } from '#client/constants';
import { set_signal_status } from './status.js';

/**
 * @param {Effect} effect
 * @param {Map<Reaction, number>} dirty_reactions
 */
export function defer_effect(effect, dirty_reactions) {
	if ((effect.f & DIRTY) !== 0) {
		dirty_reactions.set(effect, DIRTY);
	} else if ((effect.f & MAYBE_DIRTY) !== 0 && dirty_reactions.get(effect) !== DIRTY) {
		dirty_reactions.set(effect, MAYBE_DIRTY);
	}

	// mark as clean so they get scheduled if they depend on pending async state
	set_signal_status(effect, CLEAN);

	if (effect.deps === null) return;

	for (const dep of effect.deps) {
		defer_derived(dep, dirty_reactions);
	}
}

/**
 * @param {Value} value
 * @param {Map<Reaction, number>} dirty_reactions
 */
function defer_derived(value, dirty_reactions) {
	if ((value.f & DERIVED) === 0 || (value.f & CLEAN) !== 0) return;

	var derived = /** @type {Derived} */ (value);

	if ((derived.f & DIRTY) !== 0) {
		dirty_reactions.set(derived, DIRTY);
		set_signal_status(derived, MAYBE_DIRTY);
	} else if (!dirty_reactions.has(derived)) {
		dirty_reactions.set(derived, MAYBE_DIRTY);
	}

	if (derived.deps === null) return;

	for (const dep of derived.deps) {
		defer_derived(dep, dirty_reactions);
	}
}
