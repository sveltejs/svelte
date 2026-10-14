/** @import { Effect } from '#client' */

/**
 * @param {Effect} effect
 * @param {Set<Effect>} dirty_effects
 */
export function defer_effect(effect, dirty_effects) {
	dirty_effects.add(effect);
}
