/** @import { Effect } from '#client' */
import { CLEAN, DIRTY, MAYBE_DIRTY } from '#client/constants';
import { set_signal_status } from './status.js';

/**
 * @param {Effect} effect
 * @param {Map<Effect, number>} dirty_reactions
 */
export function defer_effect(effect, dirty_reactions) {
	if ((effect.f & DIRTY) !== 0) {
		dirty_reactions.set(effect, DIRTY);
	} else if ((effect.f & MAYBE_DIRTY) !== 0 && dirty_reactions.get(effect) !== DIRTY) {
		dirty_reactions.set(effect, MAYBE_DIRTY);
	}

	// mark as clean so they get scheduled if they depend on pending async state
	set_signal_status(effect, CLEAN);
}
