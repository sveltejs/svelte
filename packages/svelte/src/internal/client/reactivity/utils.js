/** @import { Effect } from '#client' */
import { CLEAN, DIRTY, MAYBE_DIRTY } from '#client/constants';
import { set_signal_status } from './status.js';

/**
 * Note that `effect` needs to be (re-)validated, without downgrading a DIRTY effect to MAYBE_DIRTY
 * @param {Map<Effect, number>} dirty_reactions
 * @param {Effect} effect
 * @param {number} status DIRTY or MAYBE_DIRTY
 */
export function add_dirty_reaction(dirty_reactions, effect, status) {
	if (status === DIRTY || dirty_reactions.get(effect) !== DIRTY) {
		dirty_reactions.set(effect, status);
	}
}

/**
 * @param {Effect} effect
 * @param {Map<Effect, number>} dirty_reactions
 */
export function defer_effect(effect, dirty_reactions) {
	var status = effect.f & (DIRTY | MAYBE_DIRTY);

	if (status !== 0) {
		add_dirty_reaction(dirty_reactions, effect, status);
	}

	// mark as clean so they get scheduled if they depend on pending async state
	set_signal_status(effect, CLEAN);
}
