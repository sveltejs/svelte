/** @import { Reaction } from '#client' */
import { DESTROYED, STALE_REACTION } from '../constants.js';
/** @import { Batch } from './batch.js' */
/** @import { Script, ScriptAttempt } from './script-replay.js' */

/**
 * Permission to write is scoped to one initializer reaction, not inherited by
 * nested deriveds/effects. Read tracking is unaffected. The context never lives
 * across a suspension or a user callback outside this synchronous segment.
 * @typedef {{ attempt: ScriptAttempt, reaction: Reaction }} InitializationContext
 */
/** @type {InitializationContext | null} */
export let initialization_context = null;

/** @param {InitializationContext | null} context */
export function set_initialization_context(context) {
	initialization_context = context;
}

/** Permission and provenance apply only to the active initializer reaction.
 * @param {Reaction | null} reaction
 */
export function get_initialization_context(reaction) {
	var context = initialization_context;
	if (!context || context.reaction !== reaction) return null;
	var attempt = context.attempt;
	if (
		attempt.outcome === 'cancelled' ||
		canonical(attempt.batch).scripts_discarded ||
		(attempt.scope.f & DESTROYED) !== 0 ||
		(attempt.adopted && attempt.script.sealed !== attempt)
	)
		throw STALE_REACTION;
	return context;
}

/** @type {WeakMap<Reaction, { script: Script, site: number }>} */
export const script_reactions = new WeakMap();

/** @param {Batch} batch */
function canonical(batch) {
	while (batch.merged !== null) batch = batch.merged;
	return batch;
}

/**
 * An invalidation candidate is consumed only when the effect is validated/run.
 * External writes win over own initialization writes, including when an effect
 * was already dirty before the external write reached it.
 * @param {Batch} batch
 * @param {Reaction} reaction
 * @param {Batch | null} origin
 */
export function note_script_invalidation(batch, reaction, origin) {
	var site = script_reactions.get(reaction);
	if (!site) return;
	var attempt = batch.script_initializers.get(site.script.effect);
	if (!attempt) return;
	var reason = origin !== null && canonical(origin) === canonical(batch) ? 1 : 2;
	attempt.invalidations.set(site.site, (attempt.invalidations.get(site.site) ?? 0) | reason);
}

/** @param {Batch | null} batch @param {Reaction} reaction */
export function suppress_initialization_update(batch, reaction) {
	var site = script_reactions.get(reaction);
	if (!site || !batch) return false;
	var attempt = batch.script_initializers.get(site.script.effect);
	if (!attempt || ((attempt.invalidations.get(site.site) ?? 0) & 2) !== 0) return false;
	// Adoption has to run even if the old prologue also has pending own writes.
	if (
		site.script.sealed !== null &&
		!attempt.adopted &&
		!attempt.private_retry &&
		attempt.outcome !== 'failed'
	)
		return false;
	var complete =
		site.site === -1
			? attempt.factory_complete
			: attempt.started.has(site.site) || attempt.snapshot.progress > site.site;
	if (complete && (site.site === -1 || site.script.kinds[site.site] !== 'async')) {
		attempt.invalidations.delete(site.site);
		return true;
	}
	return false;
}

/** @param {Batch | null} batch @param {Reaction} reaction */
export function needs_script_admission(batch, reaction) {
	var site = script_reactions.get(reaction);
	if (!site || !batch || site.site !== -1) return false;
	var attempt = batch.script_initializers.get(site.script.effect);
	return (
		!attempt ||
		((attempt.invalidations.get(-1) ?? 0) & 4) !== 0 ||
		(site.script.sealed !== null &&
			!attempt.adopted &&
			!attempt.private_retry &&
			attempt.outcome !== 'failed')
	);
}

/** @param {Batch | null} batch @param {Reaction} reaction */
export function clear_script_invalidation(batch, reaction) {
	var site = script_reactions.get(reaction);
	if (site && batch)
		batch.script_initializers.get(site.script.effect)?.invalidations.delete(site.site);
}
