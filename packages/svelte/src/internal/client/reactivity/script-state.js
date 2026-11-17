/** @import { Value, BatchValue } from '#client' */
/** @import { Batch } from './batch.js' */
/** @import { Script, ScriptAttempt } from './script-replay.js' */
import { DIRTY, DESTROYED } from '../constants.js';

/** @typedef {{ value: any, wv: number }} StateOverride */

/** Only actual compiler-created state sources are registered, not proxy fields.
 * @type {WeakMap<Value, { script: Script, slot: number, attempt: ScriptAttempt }>}
 */
export const script_states = new WeakMap();

/** @param {Batch} batch */
function canonical(batch) {
	while (batch.merged !== null) batch = batch.merged;
	return batch;
}

/** @param {Batch} batch @param {Script} script @param {number} slot @param {StateOverride} override */
function record_override(batch, script, slot, override) {
	var overrides = batch.script_state_overrides.get(script);
	if (!overrides) batch.script_state_overrides.set(script, (overrides = new Map()));
	var previous = overrides.get(slot);
	if (previous && previous.wv >= override.wv) return;
	overrides.set(slot, override);
	var attempt = batch.script_initializers.get(script.effect);
	// State allocated inside the factory is intentionally not a tracked external
	// read of that factory. Its logical override therefore also forces admission.
	if (attempt) attempt.invalidations.set(-1, (attempt.invalidations.get(-1) ?? 0) | 6);
	batch.schedule(script.effect, DIRTY);
}

/** Record an explicit external edit before a fresh factory creates replacement state.
 * @param {Batch} batch @param {Value} source @param {BatchValue} entry
 */
export function record_script_state_write(batch, source, entry) {
	var state = script_states.get(source);
	if (!state || state.attempt.outcome === 'cancelled' || (state.script.effect.f & DESTROYED) !== 0)
		return;
	if (state.script.sealed !== null) return;
	record_override(batch, state.script, state.slot, { value: entry.v, wv: entry.wv });
}

/** A real writer need not select the source-owning component. Carry its committed
 * edit to that source's live attempt, not to unrelated same-slot fork environments.
 * @param {Batch} receiver @param {Value} source @param {BatchValue} entry
 */
export function rebase_script_state_write(receiver, source, entry) {
	if (entry.init) return;
	var state = script_states.get(source);
	if (!state || state.attempt.outcome === 'cancelled' || state.attempt.adopted) return;
	if (
		canonical(state.attempt.batch) !== receiver ||
		!receiver.script_initializers.has(state.script.effect)
	)
		return;
	record_override(receiver, state.script, state.slot, { value: entry.v, wv: entry.wv });
}
