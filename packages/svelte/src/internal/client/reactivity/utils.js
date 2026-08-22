/** @import { Effect } from '#client' */
import { CLEAN, DIRTY, MAYBE_DIRTY } from '#client/constants';
import { set_signal_status } from './status.js';

/**
 * @param {Effect} effect
 * @param {Set<Effect>} dirty_effects
 * @param {Set<Effect>} maybe_dirty_effects
 */
export function defer_effect(effect, dirty_effects, maybe_dirty_effects) {
	if ((effect.f & DIRTY) !== 0) {
		dirty_effects.add(effect);
	} else if ((effect.f & MAYBE_DIRTY) !== 0) {
		maybe_dirty_effects.add(effect);
	}

	// mark as clean so they get scheduled if they depend on pending async state
	set_signal_status(effect, CLEAN);
}
