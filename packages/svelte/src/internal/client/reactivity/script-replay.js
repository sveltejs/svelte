/** @import { Derived, Effect, ScriptReadiness, Source, Value } from '#client' */
/** @import { Batch } from './batch.js' */
import {
	ASYNC,
	CLEAN,
	DESTROYED,
	DIRTY,
	MAYBE_DIRTY,
	EFFECT_PRESERVED,
	EFFECT_OFFSCREEN,
	SCRIPT_EFFECT,
	STALE_REACTION
} from '../constants.js';
import { UNINITIALIZED } from '../../../constants.js';
import {
	active_effect,
	active_reaction,
	abort_controller,
	get,
	set_active_effect,
	untrack,
	update_effect
} from '../runtime.js';
import {
	initialization_context,
	get_initialization_context,
	set_initialization_context,
	script_reactions
} from './script-context.js';
import { current_batch, merge_requests } from './batch.js';
import { capture, increment_pending, merge_target, unset_context } from './async.js';
import { async_effect, block, branch, destroy_effect, teardown } from './effects.js';
import { derived } from './deriveds.js';
import { source, internal_set } from './sources.js';
import { script_states } from './script-state.js';
import { set_signal_status } from './status.js';
import { without_reactive_context } from '../dom/elements/bindings/shared.js';
import { has_error_boundary, invoke_error_boundary } from '../error-handling.js';

/**
 * This is deliberately a suffix-initialization kernel, not a second component runtime.
 * The compiler only supplies root-await producers, synchronous deriveds and immutable
 * locals. In particular, no user code resumes inside a thunk after an await.
 * Attempt object identity is the generation token; snapshots are immutable publications.
 *
 * @typedef {'async' | 'derived' | 'local' | 'await' | 'statement'} ScriptKind
 * @typedef {{ reactive: boolean, read: () => any, assign?: (value: any, proxy?: boolean) => any, update?: (delta: number, pre: boolean) => any, mutate?: (operation: any) => any }} ScriptAccessor
 * @typedef {{ read: (index: number) => any, get: (index: number) => ScriptAccessor, state: (index: number, value: Source) => Source }} ScriptFacade
 * @typedef {{ thunks: Array<(() => any) | null>, environment: ScriptAccessor[] }} ScriptFactoryResult
 * @typedef {{ value: unknown }} ScriptFailure
 * @typedef {{ attempt: ScriptAttempt, progress: number, values: any[], environment: ScriptAccessor[] | null, private_retry: boolean, errors: Map<number, ScriptFailure>, error: ScriptFailure | null }} ScriptSnapshot
 * @typedef {Object} Script
 * @property {(bindings: Value[], facade: ScriptFacade) => ScriptFactoryResult | Array<(() => any) | null>} factory
 * @property {ScriptKind[]} kinds
 * @property {Map<number, [number, number]>} groups
 * @property {Source<ScriptSnapshot | null>} selection
 * @property {Map<number, Source>} producer_values
 * @property {Source<any[] | null>} locals
 * @property {Derived<ScriptAttempt | null>} selected
 * @property {Derived<ScriptAccessor[] | null>} environment
 * @property {ScriptReadiness} environment_ready
 * @property {ScriptFacade} access
 * @property {Map<number, Derived>} readers
 * @property {Derived<boolean>[]} available
 * @property {ScriptReadiness[]} ready
 * @property {Derived[]} bindings
 * @property {Effect} effect
 * @property {Effect | null} cleanup
 * @property {Map<number, Effect>} sites
 * @property {Effect | null} admitting
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
 * @property {Map<number, number>} invalidations
 * @property {Set<number>} started
 * @property {boolean} factory_complete
 * @property {boolean} adopted
 * @property {boolean} private_retry
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
 * @param {(bindings: Value[], facade: ScriptFacade) => ScriptFactoryResult | Array<(() => any) | null>} factory
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
	var environment = derived(() => get(selection)?.environment ?? null);
	var environment_ready = /** @type {ScriptReadiness} */ (
		derived(() => {
			var frame = get(selection);
			return frame?.environment != null && !frame.private_retry;
		})
	);

	/** @type {Script} */
	var script = {
		factory,
		kinds,
		groups: new Map(groups.map(([start, end, thunk]) => [start, [end, thunk]])),
		selection,
		producer_values: new Map(),
		locals: source(/** @type {any[] | null} */ (null)),
		selected,
		environment,
		environment_ready,
		access: {
			read: (index) => script_read(script, index),
			get: (index) => script_accessor(script, index),
			state: (index, value) => {
				var attempt = initialization_context?.attempt;
				if (!attempt || attempt.script !== script)
					throw new Error('State registered outside initialization');
				script_states.set(value, { script, slot: index, attempt });
				var overrides = merge_target(attempt.batch).script_state_overrides.get(script);
				if (overrides?.has(index)) internal_set(value, overrides.get(index)?.value);
				return value;
			}
		},
		readers: new Map(),
		available: [],
		ready: [],
		bindings: [],
		effect: /** @type {Effect} */ (/** @type {unknown} */ (null)),
		cleanup: null,
		sites: new Map(),
		admitting: null,
		sealed: null,
		attempts: new Set(),
		runs: new Set()
	};

	environment_ready.kind = 'script';
	environment_ready.script = script;
	environment_ready.checkpoint = -1;

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
					if (locals !== null && !failed_fork && !snapshot?.private_retry) return locals[i];
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
		if (script.cleanup === null) {
			script.cleanup = branch(() =>
				teardown(() => {
					for (const attempt of script.attempts) retire_attempt(attempt);
					for (const run of script.runs) run.finish();
				})
			);
		}
		script_reactions.set(script.effect, { script, site: -1 });
		var batch = merge_target(/** @type {Batch} */ (current_batch));
		if (batch.scripts_discarded) return;
		var attempt = batch.script_initializers.get(script.effect);
		var reason = attempt?.invalidations.get(-1) ?? 0;
		attempt?.invalidations.delete(-1);
		if (
			attempt &&
			attempt.factory_complete &&
			(reason & 2) !== 0 &&
			(script.sealed === null || attempt.outcome === 'failed' || attempt.private_retry)
		) {
			start_attempt(script, batch);
		} else {
			ensure_attempt(script, batch);
		}
	}, SCRIPT_EFFECT | EFFECT_PRESERVED);

	// Siblings of the scheduler, not disposable children of one of its executions.
	// Even sites with no dependencies keep an effect, rather than the async_derived fast path.
	for (let i = 0; i < kinds.length; i++) {
		const site = i;
		async_effect(() => run_site(script, site));
		var group = script.groups.get(site);
		if (group) i = group[0] - 1;
	}

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

/** Select the accessor before evaluating an assignment RHS. @param {Script} script @param {number} index */
export function script_accessor(script, index) {
	var environment = get(script.environment);
	if (environment === null) throw UNINITIALIZED;
	return environment[index];
}

/** Ordinary getters stay live; reactive getters have stable equality-preserving projections.
 * @param {Script} script @param {number} index
 */
export function script_read(script, index) {
	var reader = script.readers.get(index);
	return reader ? get(reader) : script_accessor(script, index).read();
}

/** Execute admission on the prologue reaction, not on the calling producer.
 * @param {Script} script
 */
function run_prologue(script) {
	var previous = script.admitting;
	var caller = /** @type {Effect} */ (active_reaction);
	script.admitting = caller;
	try {
		update_effect(script.effect);
		// Writes during the factory invalidated the caller's old inputs. Its new
		// execution has not read anything yet and will record the new versions.
		set_signal_status(caller, CLEAN);
	} finally {
		script.admitting = previous;
	}
}

/** @param {Script} script @param {Batch} batch */
function ensure_attempt(script, batch) {
	var attempt = batch.script_initializers.get(script.effect);
	if (attempt) {
		if (
			script.sealed !== null &&
			!attempt.adopted &&
			!attempt.private_retry &&
			attempt.outcome !== 'failed'
		)
			adopt_attempt(attempt);
		return attempt;
	}
	if (script.sealed === null) {
		if (active_reaction === script.effect) return start_attempt(script, batch);
		run_prologue(script);
		return /** @type {ScriptAttempt} */ (batch.script_initializers.get(script.effect));
	}

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
		invalidations: new Map(),
		started: new Set(),
		factory_complete: true,
		adopted: true,
		private_retry: false,
		snapshot: /** @type {ScriptSnapshot} */ (/** @type {unknown} */ (null)),
		finish: () => {}
	};
	attempt.snapshot = {
		attempt,
		progress: script.kinds.length,
		values,
		environment: established.snapshot.environment,
		private_retry: false,
		errors: new Map(),
		error: null
	};
	script.attempts.add(attempt);
	batch.script_initializers.set(script.effect, attempt);
	publish(attempt, attempt.snapshot);
	return attempt;
}

/** Convert a healthy private initialization coherently, never running its remaining
 * imperative stages against another attempt's state. @param {ScriptAttempt} attempt
 */
function adopt_attempt(attempt) {
	var script = attempt.script;
	var established = /** @type {ScriptAttempt} */ (script.sealed);
	if (attempt === established || attempt.adopted) return;
	attempt.adopted = true;
	attempt.private_retry = false;
	merge_target(attempt.batch).script_state_overrides.delete(script);
	var previous_scope = attempt.scope;
	attempt.scope = established.scope;
	attempt.thunks = established.thunks;
	attempt.outcome = 'succeeded';
	var values = attempt.snapshot.values.slice();
	for (var i = 0; i < script.kinds.length; i++) {
		if (script.kinds[i] !== 'async' && script.kinds[i] !== 'derived')
			values[i] = established.snapshot.values[i];
	}
	publish(attempt, {
		...attempt.snapshot,
		progress: script.kinds.length,
		values,
		environment: established.snapshot.environment,
		private_retry: false
	});
	var batch = merge_target(attempt.batch);
	for (const [site, effect] of script.sites) {
		if (script.kinds[site] === 'async' && !attempt.started.has(site)) {
			// A suspended initializer has no producer inputs yet. Adoption validates
			// the established run instead of treating false->true readiness as new data.
			batch.records?.delete(effect);
			set_signal_status(effect, MAYBE_DIRTY);
			batch.schedule(effect, MAYBE_DIRTY);
		}
	}
	// Publication precedes cancellation: abort callbacks may reenter the runtime.
	for (const run of script.runs) {
		if (run.attempt === attempt && script.kinds[run.site] !== 'async') {
			run.finish();
			abort_run(run);
		}
	}
	if (previous_scope !== established.scope) destroy_effect(previous_scope);
	attempt.finish();
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
	if (previous) retire_attempt(previous, true);

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
		invalidations: new Map(),
		started: new Set(),
		factory_complete: false,
		adopted: false,
		private_retry: script.sealed !== null,
		snapshot: /** @type {ScriptSnapshot} */ (/** @type {unknown} */ (null)),
		finish: () => {
			if (finished) return;
			finished = true;
			decrement();
		}
	};
	attempt.environment = attempt;
	attempt.snapshot = {
		attempt,
		progress: 0,
		values: [],
		environment: null,
		private_retry: attempt.private_retry,
		errors: new Map(),
		error: null
	};
	script.attempts.add(attempt);
	batch.script_initializers.set(script.effect, attempt);
	publish(attempt, attempt.snapshot);

	var owner = active_effect;
	var previous_context = initialization_context;
	set_active_effect(attempt.scope);
	set_initialization_context({ attempt, reaction: /** @type {Effect} */ (active_reaction) });
	try {
		var result = script.factory(script.bindings, script.access);
		get_initialization_context(active_reaction);
		for (const site of script.sites.values()) {
			if (site !== script.admitting) batch.schedule(site, DIRTY);
		}
		var environment = Array.isArray(result) ? [] : result.environment;
		attempt.thunks = Array.isArray(result) ? result : result.thunks;
		attempt.factory_complete = true;
		publish(attempt, { ...attempt.snapshot, environment });
		// These caches outlive every private scope. Allocation never evaluates getters.
		set_active_effect(script.effect);
		for (let i = 0; i < environment.length; i++) {
			if (environment[i].reactive && !script.readers.has(i)) {
				script.readers.set(
					i,
					derived(() => {
						// Keep this view's projection version even when adopting an environment
						// whose equal getter value has another global cache version.
						var frame = get(script.selection);
						if (frame?.environment == null) throw UNINITIALIZED;
						return frame.environment[i].read();
					})
				);
			}
		}
		if (script.kinds.length === 0) {
			attempt.outcome = 'succeeded';
			attempt.finish();
		}
	} catch (error) {
		attempt.factory_complete = true;
		if (error !== STALE_REACTION && attempt.outcome !== 'cancelled') fail(attempt, error);
	} finally {
		set_initialization_context(previous_context);
		set_active_effect(owner);
	}
	return attempt;
}

/** @param {ScriptAttempt} attempt @param {ScriptSnapshot} snapshot */
function publish(attempt, snapshot) {
	attempt.snapshot = snapshot;
	var batch = merge_target(attempt.batch);
	if (batch.scripts_discarded || attempt.outcome === 'cancelled') return;
	batch.capture(attempt.script.selection, snapshot, false, false, null, batch);
}

/** @param {Script} script @param {number} site */
function run_site(script, site) {
	var batch = merge_target(/** @type {Batch} */ (current_batch));
	if (batch.scripts_discarded) return;
	script_reactions.set(/** @type {Effect} */ (active_reaction), { script, site });
	script.sites.set(site, /** @type {Effect} */ (active_reaction));
	var attempt = ensure_attempt(script, batch);
	var reason = attempt.invalidations.get(site) ?? 0;
	attempt.invalidations.delete(site);
	if (attempt.outcome === 'cancelled') return;
	var snapshot = /** @type {ScriptSnapshot} */ (untrack(() => get(script.selection)));
	if (snapshot.environment === null) {
		get(script.environment_ready);
		return;
	}
	if (snapshot.progress <= site && site > 0 && !get(script.available[site - 1])) return;
	var kind = script.kinds[site];
	var group = script.groups.get(site);

	if (kind === 'derived' && !group) {
		if (snapshot.progress <= site && snapshot.error === null) {
			complete(attempt, snapshot, site, undefined);
		}
		return;
	}
	if (
		kind !== 'async' &&
		script.sealed !== null &&
		!attempt.private_retry &&
		snapshot.progress > site
	)
		return;

	// An already-observed prefix changed while later initialization was unfinished.
	// Never combine its old locals with new producer values. After sealing, locals are
	// permanent and only ordinary producer runs change, including in existing forks.
	if (
		(script.sealed === null || attempt.private_retry) &&
		(reason & 2) !== 0 &&
		attempt.started.has(site)
	) {
		attempt.invalidations.set(-1, 2);
		run_prologue(script);
		run_site(script, site);
		return;
	}
	if (kind !== 'async' && snapshot.progress > site) return;
	attempt.started.add(site);

	// Replacing work within one view always retires that run. Independent real
	// views remain independent unless user code requested an abort signal.
	for (const previous of script.runs) {
		if (previous.site === site && merge_target(previous.batch) === batch) {
			previous.finish();
			abort_run(previous);
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
	var previous_context = initialization_context;
	if (group || kind !== 'async') {
		set_initialization_context({ attempt, reaction: /** @type {Effect} */ (active_reaction) });
	}
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
		set_initialization_context(previous_context);
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
			var batch = merge_target(attempt.batch);
			batch.capture(signal, result, signal.equals(result), false, null, batch);
		} else {
			values[i] = result;
		}
		errors.delete(i);
	}
	var progress = Math.max(snapshot.progress, last);
	var error = errors.values().next().value ?? null;
	var next = {
		attempt,
		progress,
		values,
		environment: snapshot.environment,
		private_retry: snapshot.private_retry,
		errors,
		error
	};

	publish(attempt, next);

	if (progress === attempt.script.kinds.length) {
		attempt.outcome = error === null ? 'succeeded' : 'failed';
	}
	if (
		error === null &&
		attempt.script.sealed !== null &&
		attempt.script.sealed !== attempt &&
		!attempt.adopted &&
		(!attempt.private_retry || progress === attempt.script.kinds.length)
	) {
		adopt_attempt(attempt);
	} else if (progress === attempt.script.kinds.length) {
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

/** User abort callbacks are not initializer code. @param {ScriptRun} run */
function abort_run(run) {
	var context = initialization_context;
	set_initialization_context(null);
	try {
		without_reactive_context(() => run.controller?.abort(STALE_REACTION));
	} finally {
		set_initialization_context(context);
	}
}

/** @param {ScriptAttempt} attempt @param {boolean} keep_overrides */
function retire_attempt(attempt, keep_overrides = false) {
	attempt.outcome = 'cancelled';
	attempt.finish();
	attempt.script.attempts.delete(attempt);
	var owner = merge_target(attempt.batch);
	if (owner.script_initializers.get(attempt.script.effect) === attempt) {
		owner.script_initializers.delete(attempt.script.effect);
		if (!keep_overrides) owner.script_state_overrides.delete(attempt.script);
	}
	for (const run of attempt.script.runs) {
		if (run.attempt === attempt) {
			run.finish();
			abort_run(run);
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
		if (losing && losing !== attempt) retire_attempt(losing, true);
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
			attempt.adopted = true;
			attempt.scope.f &= ~EFFECT_OFFSCREEN;
			for (const other of script.attempts) {
				if (other === attempt || other.outcome === 'failed' || other.outcome === 'cancelled')
					continue;
				const owner = merge_target(other.batch);
				owner.schedule(script.effect, DIRTY);
				queueMicrotask(() => {
					if (owner.linked && !owner.scripts_discarded) owner.flush();
				});
			}
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
		batch.script_state_overrides.delete(script);
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
