/** @import { Derived, Effect, Value } from '#client' */
import { CLEAN, DERIVED, DIRTY, MAYBE_DIRTY } from '#client/constants';
import { set_signal_status } from './status.js';

/**
 * @param {Effect} effect
 * @param {Set<Effect>} dirty_effects
 * @param {Set<Effect>} maybe_dirty_effects
 * @param {Set<Derived>} dirty_deriveds
 * @param {Set<Derived>} maybe_dirty_deriveds
 */
export function defer_effect(
	effect,
	dirty_effects,
	maybe_dirty_effects,
	dirty_deriveds,
	maybe_dirty_deriveds
) {
	if ((effect.f & DIRTY) !== 0) {
		dirty_effects.add(effect);
	} else if ((effect.f & MAYBE_DIRTY) !== 0) {
		maybe_dirty_effects.add(effect);
	}

	// mark as clean so they get scheduled if they depend on pending async state
	set_signal_status(effect, CLEAN);

	if (effect.deps === null) return;

	for (const dep of effect.deps) {
		defer_derived(dep, dirty_deriveds, maybe_dirty_deriveds);
	}
}

/**
 * @param {Value} value
 * @param {Set<Derived>} dirty_deriveds
 * @param {Set<Derived>} maybe_dirty_deriveds
 */
function defer_derived(value, dirty_deriveds, maybe_dirty_deriveds) {
	if ((value.f & DERIVED) === 0 || (value.f & CLEAN) !== 0) return;

	var derived = /** @type {Derived} */ (value);

	if ((derived.f & DIRTY) !== 0) {
		dirty_deriveds.add(derived);
		set_signal_status(derived, MAYBE_DIRTY);
	} else if ((derived.f & MAYBE_DIRTY) !== 0) {
		// maybe_dirty_deriveds.add(derived);
	}

	// mark as clean so they don't get rerun unnecessarily in other batches
	// set_signal_status(derived, CLEAN);

	if (derived.deps === null) return;

	for (const dep of derived.deps) {
		defer_derived(dep, dirty_deriveds, maybe_dirty_deriveds);
	}
}
