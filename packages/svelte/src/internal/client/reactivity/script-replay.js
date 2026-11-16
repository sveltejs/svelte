/** @import { Derived, Effect, ScriptReadiness, Source, Value } from '#client' */
/** @import { Batch } from './batch.js' */
import {
	ASYNC,
	DESTROYED,
	EFFECT_PRESERVED,
	EFFECT_OFFSCREEN,
	SCRIPT_EFFECT,
	STALE_REACTION
} from '../constants.js';
import { UNINITIALIZED } from '../../../constants.js';
import { active_effect, abort_controller, get, set_active_effect, untrack } from '../runtime.js';
import { current_batch, merge_requests } from './batch.js';
import { capture, increment_pending, merge_target, unset_context } from './async.js';
import { async_effect, block, branch, destroy_effect, teardown } from './effects.js';
import { derived } from './deriveds.js';
import { source } from './sources.js';
import { has_error_boundary, invoke_error_boundary } from '../error-handling.js';

/**
 * This is deliberately a suffix-initialization kernel, not a second component runtime.
 * The compiler only supplies root-await producers, synchronous deriveds and immutable
 * locals. In particular, no user code resumes inside a thunk after an await.
 * Attempt object identity is the generation token; snapshots are immutable publications.
 *
 * @typedef {'async' | 'derived' | 'local' | 'await' | 'statement'} ScriptKind
 * @typedef {{ value: unknown }} ScriptFailure
 * @typedef {{ attempt: ScriptAttempt, progress: number, values: any[], errors: Map<number, ScriptFailure>, error: ScriptFailure | null }} ScriptSnapshot
 * @typedef {Object} Script
 * @property {(bindings: Value[]) => Array<(() => any) | null>} factory
 * @property {ScriptKind[]} kinds
 * @property {Map<number, [number, number]>} groups
 * @property {Source<ScriptSnapshot | null>} selection
 * @property {Map<number, Source>} producer_values
 * @property {Source<any[] | null>} locals
 * @property {Derived<ScriptAttempt | null>} selected
 * @property {Derived<boolean>[]} available
 * @property {ScriptReadiness[]} ready
 * @property {Derived[]} bindings
 * @property {Effect} effect
 * @property {ScriptAttempt | null} sealed
 * @property {Set<ScriptAttempt>} attempts
 * @property {Set<ScriptRun>} runs
 *
 * @typedef {Object} ScriptAttempt
 * @property {Script} script
 * @property {Batch} batch
 * @property {Array<(() => any) | null>} thunks
 * @property {ScriptAttempt} environment
 * @property {Effect} scope
 * @property {'pending' | 'succeeded' | 'failed' | 'cancelled'} outcome
 * @property {ScriptSnapshot} snapshot
 * @property {Set<ScriptFailure>} reported
 * @property {() => void} finish
 *
 * @typedef {Object} ScriptRun
 * @property {ScriptAttempt} attempt
 * @property {Batch} batch
 * @property {number} site
 * @property {AbortController | null} controller
 * @property {boolean} active
 * @property {() => void} finish
 */

/**
 * Allocate the stable shell once. Each admitted batch gets a fresh factory environment,
 * but producer effects and public projections keep their identity for its whole lifetime.
 *
 * @param {(bindings: Value[]) => Array<(() => any) | null>} factory
 * @param {ScriptKind[]} kinds
 * @param {number[]} checkpoints The original coarse checkpoint of each declaration
 * @param {Array<[number, number, number]>} groups Atomic synchronous groups: start, exclusive end, thunk index
 * @returns {Script}
 */
export function script_replay(factory, kinds, checkpoints, groups = []) {
	// A null baseline can be undone by another view, unlike UNINITIALIZED. ASYNC marks
	// these writes as produced results: a rebase must not replace a fork's private frame.
	var selection = source(/** @type {ScriptSnapshot | null} */ (null));
	selection.f |= ASYNC;
	var selected = derived(() => get(selection)?.attempt.environment ?? null);

	/** @type {Script} */
	var script = {
		factory,
		kinds,
		groups: new Map(groups.map(([start, end, thunk]) => [start, [end, thunk]])),
		selection,
		producer_values: new Map(),
		locals: source(/** @type {any[] | null} */ (null)),
		selected,
		available: [],
		ready: [],
		bindings: [],
		effect: /** @type {Effect} */ (/** @type {unknown} */ (null)),
		sealed: null,
		attempts: new Set(),
		runs: new Set()
	};

	for (let i = 0; i < kinds.length; i++) {
		if (kinds[i] === 'async') {
			var value = source(null);
			value.f |= ASYNC;
			script.producer_values.set(i, value);
		}
		script.available.push(
			derived(() => {
				var snapshot = get(selection);
				return snapshot !== null && !snapshot.errors.has(i) && snapshot.progress > i;
			})
		);
		script.bindings.push(
			derived(() => {
				if (kinds[i] === 'derived') {
					var attempt = get(selected);
					if (attempt === null) throw UNINITIALIZED;
					return /** @type {() => any} */ (attempt.thunks[i])();
				}

				var snapshot = get(selection);
				if (kinds[i] !== 'async') {
					var locals = get(script.locals);
					// Publishing another view cannot itself supersede this fork's cached
					// failure. Keep its failed expression's local inputs until a genuine
					// producer replacement succeeds; healthy views adopt lifetime locals.
					var failed_fork =
						snapshot !== null &&
						snapshot.error !== null &&
						(merge_target(snapshot.attempt.batch).is_fork ||
							merge_target(snapshot.attempt.batch).fork_commit_waiters.size > 0);
					if (locals !== null && !failed_fork) return locals[i];
				}

				if (snapshot === null || snapshot.progress <= i) throw UNINITIALIZED;
				if (snapshot.errors.has(i)) throw snapshot.errors.get(i)?.value;
				return kinds[i] === 'async'
					? get(/** @type {Source} */ (script.producer_values.get(i)))
					: snapshot.values[i];
			})
		);
	}

	for (let checkpoint = 0; checkpoint <= Math.max(-1, ...checkpoints); checkpoint++) {
		const last = checkpoints.lastIndexOf(checkpoint);
		var ready = /** @type {ScriptReadiness} */ (
			derived(() => {
				var snapshot = get(selection);
				return (
					snapshot !== null &&
					snapshot.progress > last &&
					[...snapshot.errors.keys()].every((site) => site > last)
				);
			})
		);
		ready.kind = 'script';
		ready.script = script;
		ready.checkpoint = last;
		script.ready.push(ready);
	}

	block(() => {
		script.effect = /** @type {Effect} */ (active_effect);
		var batch = merge_target(/** @type {Batch} */ (current_batch));
		if (!batch.scripts_discarded) ensure_attempt(script, batch);
	}, SCRIPT_EFFECT | EFFECT_PRESERVED);

	// Siblings of the scheduler, not disposable children of one of its executions.
	// Even sites with no dependencies keep an effect, rather than the async_derived fast path.
	for (let i = 0; i < kinds.length; i++) {
		const site = i;
		async_effect(() => run_site(script, site));
		var group = script.groups.get(site);
		if (group) i = group[0] - 1;
	}

	teardown(() => {
		for (const attempt of script.attempts) retire_attempt(attempt);
		for (const run of script.runs) run.finish();
	});

	return script;
}

/** @param {Script} script @param {number} slot */
export function script_binding(script, slot) {
	return script.bindings[slot];
}

/** @param {Script} script @param {number} slot */
export function script_value(script, slot) {
	return get(script.bindings[slot]);
}

/** @param {Script} script @param {Batch} batch */
function ensure_attempt(script, batch) {
	var attempt = batch.script_initializers.get(script.effect);
	if (attempt) return attempt;
	if (script.sealed === null) return start_attempt(script, batch);

	// An established instance still has per-view producer outcomes, but no new factory
	// or script execution. Its stable environment projection avoids invalidating every
	// producer just because another batch starts using the instance.
	var snapshot = /** @type {ScriptSnapshot} */ (untrack(() => get(script.selection)));
	var established = script.sealed;
	var values = snapshot.values.slice();
	for (var i = 0; i < script.kinds.length; i++) {
		if (script.kinds[i] !== 'async' && script.kinds[i] !== 'derived') {
			values[i] = established.snapshot.values[i];
		}
	}
	attempt = {
		script,
		batch,
		thunks: established.thunks,
		environment: established.environment,
		scope: established.scope,
		outcome: 'succeeded',
		reported: new Set(),
		snapshot: /** @type {ScriptSnapshot} */ (/** @type {unknown} */ (null)),
		finish: () => {}
	};
	attempt.snapshot = {
		attempt,
		progress: script.kinds.length,
		values,
		errors: new Map(),
		error: null
	};
	script.attempts.add(attempt);
	batch.script_initializers.set(script.effect, attempt);
	publish(attempt, attempt.snapshot);
	return attempt;
}

/** @param {Script} script @param {Batch} batch */
function create_scope(script, batch) {
	var previous = active_effect;
	set_active_effect(script.effect.parent);
	try {
		var scope = branch(() => {});
		scope.f |= EFFECT_OFFSCREEN;
		batch.unskip_new_effect(scope);
		return scope;
	} finally {
		set_active_effect(previous);
	}
}

/** @param {Script} script @param {Batch} batch */
function start_attempt(script, batch) {
	var previous = batch.script_initializers.get(script.effect);
	if (previous) retire_attempt(previous);

	var decrement = increment_pending();
	var finished = false;
	/** @type {ScriptAttempt} */
	var attempt = {
		script,
		batch,
		thunks: [],
		environment: /** @type {ScriptAttempt} */ (/** @type {unknown} */ (null)),
		scope: create_scope(script, batch),
		outcome: 'pending',
		reported: new Set(),
		snapshot: /** @type {ScriptSnapshot} */ (/** @type {unknown} */ (null)),
		finish: () => {
			if (finished) return;
			finished = true;
			decrement();
		}
	};
	attempt.environment = attempt;
	attempt.snapshot = { attempt, progress: 0, values: [], errors: new Map(), error: null };
	script.attempts.add(attempt);
	batch.script_initializers.set(script.effect, attempt);
	publish(attempt, attempt.snapshot);

	var owner = active_effect;
	set_active_effect(attempt.scope);
	try {
		attempt.thunks = untrack(() => script.factory(script.bindings));
	} catch (error) {
		fail(attempt, error);
	} finally {
		set_active_effect(owner);
	}
	return attempt;
}

/** @param {ScriptAttempt} attempt @param {ScriptSnapshot} snapshot */
function publish(attempt, snapshot) {
	attempt.snapshot = snapshot;
	var batch = merge_target(attempt.batch);
	batch.capture(attempt.script.selection, snapshot, false);
}

/** @param {Script} script @param {number} site */
function run_site(script, site) {
	var batch = merge_target(/** @type {Batch} */ (current_batch));
	if (batch.scripts_discarded) return;
	var attempt = ensure_attempt(script, batch);
	get(script.selected);
	if (attempt.outcome === 'cancelled') return;
	var snapshot = /** @type {ScriptSnapshot} */ (untrack(() => get(script.selection)));
	if (snapshot.progress <= site && site > 0 && !get(script.available[site - 1])) return;
	var kind = script.kinds[site];
	var group = script.groups.get(site);

	if (kind === 'derived' && !group) {
		if (snapshot.progress <= site && snapshot.error === null) {
			complete(attempt, snapshot, site, undefined);
		}
		return;
	}
	if (kind !== 'async' && script.sealed !== null && snapshot.progress > site) return;

	// An already-observed prefix changed while later initialization was unfinished.
	// Never combine its old locals with new producer values. After sealing, locals are
	// permanent and only ordinary producer runs change, including in existing forks.
	if (script.sealed === null && (attempt.outcome === 'failed' || snapshot.progress > site)) {
		start_attempt(script, batch);
		return;
	}

	// Replacing work within one view always retires that run. Independent real
	// views remain independent unless user code requested an abort signal.
	for (const previous of script.runs) {
		if (previous.site === site && merge_target(previous.batch) === batch) {
			previous.finish();
			previous.controller?.abort(STALE_REACTION);
		}
	}
	var restore = capture();
	var decrement = increment_pending();
	/** @type {ScriptRun} */
	var run = {
		attempt,
		batch,
		site,
		controller: null,
		active: true,
		finish: () => {
			if (!run.active) return;
			run.active = false;
			script.runs.delete(run);
			decrement();
		}
	};
	script.runs.add(run);

	function handle_abort() {
		run.finish();
		var target = merge_target(batch);
		if (
			current_batch !== null &&
			merge_target(current_batch) !== target &&
			target.linked &&
			!target.scripts_discarded &&
			!target.is_fork &&
			attempt.outcome !== 'cancelled'
		) {
			merge_requests.add(target);
		}
	}

	/** @param {any} value @param {boolean} failed */
	function settle(value, failed) {
		if (!run.active || run.controller?.signal.aborted || attempt.outcome === 'cancelled') return;
		var target = merge_target(batch);
		if (!target.linked || target.scripts_discarded || (script.effect.f & DESTROYED) !== 0) {
			run.finish();
			return;
		}

		restore(true, target);
		try {
			var selected = /** @type {ScriptSnapshot | null} */ (untrack(() => get(script.selection)));
			if (selected?.attempt !== attempt) return;
			if (failed) {
				if (value !== STALE_REACTION && value !== UNINITIALIZED) fail(attempt, value, site);
			} else {
				complete(attempt, selected, site, value, group?.[0]);
			}
		} finally {
			run.finish();
			unset_context();
		}
	}

	var owner = active_effect;
	// Keep dependency/abort identity on the stable producer reaction, but anything
	// created by user code belongs to this attempt, never another view's producer run.
	set_active_effect(attempt.scope);
	try {
		// Plain snapshots track their prefix inputs until sealing too. Their result is
		// published in a microtask, after the effect has recorded those input versions,
		// so publishing the selection cannot invalidate its own in-progress reads.
		var thunk = /** @type {() => any} */ (attempt.thunks[group?.[1] ?? site]);
		var promise = Promise.resolve(kind === 'statement' && !group ? untrack(thunk) : thunk());
		run.controller = abort_controller;
		if (run.controller !== null) {
			run.controller.signal.addEventListener('abort', handle_abort);
			if (run.controller.signal.aborted) handle_abort();
		}
		promise.then(
			(value) => settle(value, false),
			(error) => settle(error, true)
		);
	} catch (error) {
		// An unavailable projection is a tracked suspension, not a user error or a value.
		// The dependency that suspended the site will wake this same stable producer.
		if (error === UNINITIALIZED) {
			run.finish();
		} else {
			run.controller = abort_controller;
			run.controller?.signal.addEventListener('abort', handle_abort);
			if (run.controller?.signal.aborted) handle_abort();
			Promise.resolve().then(() => settle(error, true));
		}
	} finally {
		set_active_effect(owner);
	}
}

/** @param {ScriptAttempt} attempt @param {ScriptSnapshot} snapshot @param {number} site @param {any} value @param {number} [end] */
function complete(attempt, snapshot, site, value, end) {
	var values = snapshot.values.slice();
	var errors = new Map(snapshot.errors);
	var last = end ?? site + 1;
	for (var i = site; i < last; i++) {
		var result = end === undefined ? value : value[i - site];
		var signal = attempt.script.producer_values.get(i);
		if (signal) {
			// Only a result produced by this view gets private provenance. Merely
			// adopting the established instance must not pin all its inherited values.
			merge_target(attempt.batch).capture(signal, result, signal.equals(result));
		} else {
			values[i] = result;
		}
		errors.delete(i);
	}
	var progress = Math.max(snapshot.progress, last);
	var error = errors.values().next().value ?? null;
	var next = { attempt, progress, values, errors, error };

	publish(attempt, next);

	if (progress === attempt.script.kinds.length) {
		attempt.outcome = error === null ? 'succeeded' : 'failed';
		attempt.finish();
	}
}

/** @param {ScriptAttempt} attempt @param {unknown} error @param {number} site */
function fail(attempt, error, site = -1) {
	attempt.outcome = 'failed';
	var errors = new Map(attempt.snapshot.errors);
	var failure = { value: error };
	errors.set(site, failure);
	publish(attempt, { ...attempt.snapshot, errors, error: errors.values().next().value ?? null });
	attempt.finish();

	var batch = merge_target(attempt.batch);
	if (!batch.is_fork) {
		// Handled failures are selected at the real commit, not captured in an early
		// callback that could outlive a successful replacement while siblings wait.
		if (batch.fork_commit_waiters.size > 0 && has_error_boundary(attempt.script.effect)) return;
		attempt.reported.add(failure);
		try {
			invoke_error_boundary(error, attempt.script.effect);
		} catch (error) {
			if (!batch.reject_fork_commit(error)) throw error;
		}
	}
}

/** @param {ScriptAttempt} attempt */
function retire_attempt(attempt) {
	attempt.outcome = 'cancelled';
	attempt.finish();
	attempt.script.attempts.delete(attempt);
	for (const run of attempt.script.runs) {
		if (run.attempt === attempt) {
			run.finish();
			run.controller?.abort(STALE_REACTION);
		}
	}
	if (attempt.scope !== attempt.script.sealed?.scope && (attempt.scope.f & DESTROYED) === 0) {
		destroy_effect(attempt.scope);
	}
}

/** Called before discard callbacks can reenter the runtime. @param {Batch} batch */
export function discard_scripts(batch) {
	for (const attempt of batch.script_initializers.values()) retire_attempt(attempt);
	batch.script_initializers.clear();
}

/** The incoming batch wins as a whole, never checkpoint-by-checkpoint. @param {Batch} target @param {Batch} incoming */
export function merge_scripts(target, incoming) {
	for (const [effect, attempt] of incoming.script_initializers) {
		var losing = target.script_initializers.get(effect);
		if (losing && losing !== attempt) retire_attempt(losing);
		target.script_initializers.set(effect, attempt);
		attempt.batch = target;
		target.unskip_effect(attempt.scope);
	}
	incoming.script_initializers.clear();
}

/** Called at the actual publication point, not whenever a batch stops waiting. @param {Batch} batch */
export function commit_scripts(batch) {
	// Read the current outcome only at actual publication. A handled speculative
	// failure can be superseded while unrelated work is pending, without a sticky
	// boundary callback capturing the old error.
	for (const attempt of [...batch.script_initializers.values()]) {
		var failure = attempt.snapshot.error;
		if (
			failure !== null &&
			!attempt.reported.has(failure) &&
			attempt.outcome === 'failed' &&
			!batch.is_skipped(attempt.script.effect)
		) {
			attempt.reported.add(failure);
			try {
				invoke_error_boundary(failure.value, attempt.script.effect);
			} catch (error) {
				if (!batch.reject_fork_commit(error)) throw error;
				return false;
			}
		}
	}
	for (const [effect, attempt] of batch.script_initializers) {
		if (batch.is_skipped(effect)) {
			retire_attempt(attempt);
			batch.script_initializers.delete(effect);
			continue;
		}
		if (attempt.outcome !== 'succeeded') continue;
		var script = attempt.script;
		if (script.sealed === null) {
			script.sealed = attempt;
			attempt.scope.f &= ~EFFECT_OFFSCREEN;
			// Established plain locals are lifetime state, not speculative producer results.
			// Publishing them separately leaves cached producer projection versions intact.
			batch.capture(script.locals, attempt.snapshot.values, false);
		} else if (attempt.scope !== script.sealed.scope) {
			// Committing an older successful fork adopts results, not a second component
			// lifetime. Its speculative registrations never mount beside the winner's.
			destroy_effect(attempt.scope);
			attempt.scope = script.sealed.scope;
		}
		batch.script_initializers.delete(effect);
		if (attempt !== script.sealed) script.attempts.delete(attempt);
	}
	return true;
}

/**
 * Reject already-cached unhandled failure before applying any speculative writes.
 * Pending work does not delay publication of a pending boundary. Failures occurring
 * before the first real commit are instead delivered to Batch.fork_commit_waiters.
 * @param {Batch} batch
 */
export function prepare_script_commit(batch) {
	for (const attempt of batch.script_initializers.values()) {
		if (
			attempt.outcome !== 'failed' ||
			batch.is_skipped(attempt.script.effect) ||
			has_error_boundary(attempt.script.effect)
		)
			continue;

		batch.activate();
		try {
			invoke_error_boundary(attempt.snapshot.error?.value, attempt.script.effect);
		} catch (error) {
			batch.discard();
			throw error;
		} finally {
			batch.deactivate();
		}
	}
}
