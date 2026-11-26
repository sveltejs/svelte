/** @import { BatchRecord, BatchValue, Derived, DerivedRecord, Effect, Reaction, Source, Value } from '#client' */
/** @import { Batch } from './batch.js'; */
import { DEV } from 'esm-env';
import {
	DERIVED,
	DIRTY,
	EFFECT_PRESERVED,
	STALE_REACTION,
	ASYNC,
	DESTROYED,
	INERT,
	CONNECTED,
	ASSIGNED,
	ERROR_VALUE,
	HAS_ABORT_CONTROLLER
} from '#client/constants';
import {
	active_reaction,
	active_effect,
	update_reaction,
	set_active_effect,
	push_reaction_value,
	is_destroying_effect,
	update_effect,
	remove_reactions,
	skipped_deps,
	new_deps,
	is_current,
	promote_record,
	changed_since,
	is_dirty,
	abort_all,
	abort_controller,
	get
} from '../runtime.js';
import { equals, safe_equals } from './equality.js';
import * as e from '../errors.js';
import * as w from '../warnings.js';
import { async_effect, destroy_effect, destroy_effect_children, teardown } from './effects.js';
import { eager_effects, set_eager_effects, source } from './sources.js';
import { get_error, invariant } from '../../shared/dev.js';
import { async_mode_flag, tracing_mode_flag } from '../../flags/index.js';
import { component_context } from '../context.js';
import { UNINITIALIZED } from '../../../constants.js';
import { batch_values, current_batch, view_batch, view_cache } from './batch.js';
import { current_runner, increment_pending, merge_target, unset_context } from './async.js';
import { deferred, includes, noop } from '../../shared/utils.js';
import { update_derived_status } from './status.js';
import { stringify_derived } from '../dev/debug.js';

/**
 * This allows us to track 'reactivity loss' that occurs when signals
 * are read after a non-context-restoring `await`. Dev-only
 * @type {{ effect: Effect, effect_deps: Set<Value>, warned: boolean } | null}
 */
export let reactivity_loss_tracker = null;

/** @param {{ effect: Effect, effect_deps: Set<Value>, warned: boolean } | null} v */
export function set_reactivity_loss_tracker(v) {
	reactivity_loss_tracker = v;
}

export const recent_async_deriveds = new Set();

/**
 * @template V
 * @param {() => V} fn
 * @returns {Derived<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function derived(fn) {
	var flags = DERIVED | DIRTY;

	if (active_effect !== null) {
		// Since deriveds are evaluated lazily, any effects created inside them are
		// created too late to ensure that the parent effect is added to the tree
		active_effect.f |= EFFECT_PRESERVED;
	}

	/** @type {Derived<V>} */
	const signal = {
		ctx: component_context,
		deps: null,
		dv: null,
		edges: null,
		effects: null,
		equals,
		f: flags,
		fn,
		reactions: null,
		rv: 0,
		v: /** @type {V} */ (UNINITIALIZED),
		wv: 0,
		parent: active_effect,
		ac: null
	};

	if (DEV && tracing_mode_flag) {
		signal.created = get_error('created at');
	}

	return signal;
}

export const OBSOLETE = Symbol('obsolete');

/**
 * @template V
 * @param {() => V | Promise<V>} fn
 * @param {string} [label]
 * @param {string} [location] If provided, print a warning if the value is not read immediately after update
 * @param {(error: unknown) => void} [onready] Called when the first result is captured; receives its error, if any
 * @returns {Source<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function async_expression(fn, label, location, onready) {
	var signal = source(/** @type {V} */ (UNINITIALIZED));
	signal.f |= ASYNC;

	if (DEV) signal.label = label ?? stringify_derived(fn);

	/** @type {Set<ReturnType<typeof deferred<V>>>} */
	var deferreds = new Set();

	// `run` continues in the creating batch's view; other batches' results wait until then.
	// A superseded or obsolete run lets another batch supply the first value.
	var runner = current_runner;

	/**
	 * The batch whose run delivers the first value (`null`: whichever comes first)
	 * @type {Batch | null}
	 */
	var resolver = runner && current_batch;

	/**
	 * Results buffered until the script continues; `null` disables buffering.
	 * @type {Array<() => void> | null}
	 */
	var waiting = runner && [];

	/**
	 * Retry buffered results, or release them once the script has continued.
	 * @param {boolean} [continued]
	 */
	function flush_waiting(continued = false) {
		var fns = /** @type {Array<() => void>} */ (waiting);
		waiting = continued ? null : [];
		if (continued) resolver = null;
		for (const fn of fns) fn();
	}

	async_effect(() => {
		var effect = /** @type {Effect} */ (active_effect);

		if (DEV) {
			reactivity_loss_tracker = { effect, effect_deps: new Set(), warned: false };
		}

		/** @type {ReturnType<typeof deferred<V>>} */
		var d = deferred();

		try {
			var result = fn();
			if (result === UNINITIALIZED) return;

			// If this code is changed at some point, make sure to still access the then property
			// of fn() to read any signals it might access, so that we track them as dependencies.
			var promise = Promise.resolve(result);
			// The then getter may also call `getAbortSignal()`, so capture its signal afterwards.
			var abort_signal = abort_controller?.signal;

			// We call `unset_context` to undo any `save` calls that happen inside `fn()`
			promise
				.then(
					(value) => {
						if (!abort_signal?.aborted) d.resolve(value);
					},
					(e) => {
						// An aborted run waits for its replacement, even if the user catches the abort.
						// A script awaiting another reaction's aborted promise must release its resolver:
						// the eager merge includes the signal's owner, but not necessarily this waiter.
						if (abort_signal?.aborted || (e === STALE_REACTION && runner === null)) {
							return;
						}

						d.reject(e === STALE_REACTION ? OBSOLETE : e);
					}
				)
				.finally(unset_context);
		} catch (error) {
			d.reject(error);
		}

		if (DEV) {
			if (reactivity_loss_tracker) {
				// Reused deps from previous run (indices 0 to skipped_deps-1)
				// We deliberately only track direct dependencies of the async expression to encourage
				// dependencies being directly visible at the point of the expression
				if (effect.deps !== null) {
					for (let i = 0; i < skipped_deps; i += 1) {
						reactivity_loss_tracker.effect_deps.add(effect.deps[i]);
					}
				}

				// New deps discovered this run
				if (new_deps !== null) {
					for (let i = 0; i < new_deps.length; i += 1) {
						reactivity_loss_tracker.effect_deps.add(new_deps[i]);
					}
				}
			}

			reactivity_loss_tracker = null;
		}

		var batch = /** @type {Batch} */ (current_batch);
		var decrement_pending = increment_pending();

		batch.async_deriveds.get(effect)?.reject(OBSOLETE);
		deferreds.add(d);
		batch.async_deriveds.set(effect, d);

		/**
		 * @param {any} value
		 * @param {unknown} error
		 */
		const handler = (value, error = undefined) => {
			if (DEV) {
				invariant(view_batch === null, 'Batch is currently active');

				reactivity_loss_tracker = null;
			}

			if (waiting !== null && error !== OBSOLETE) {
				resolver ??= batch;

				if (merge_target(batch) !== merge_target(resolver)) {
					// Recheck staleness after waiting: the batch may have rerun or been discarded.
					// Merged batches remain valid while their merge target is linked.
					waiting.push(() => {
						var obsolete =
							(effect.f & DESTROYED) !== 0 ||
							(batch.linked ? batch.async_deriveds.get(effect) !== d : !merge_target(batch).linked);

						handler(value, obsolete ? OBSOLETE : error);
					});

					return;
				}
			}

			decrement_pending();
			deferreds.delete(d);

			if (error) {
				// If the resolver's run is obsolete, let the next result supply the first value.
				// Do the same on failure if other results are pending. Try buffered results first.
				// A rerun in the same batch keeps ownership.
				if (
					waiting !== null &&
					resolver !== null &&
					(deferreds.size > 0 || error === OBSOLETE) &&
					merge_target(resolver) === merge_target(batch) &&
					merge_target(batch).async_deriveds.get(effect) === d
				) {
					resolver = null;
					flush_waiting();
					return;
				} else if (error === OBSOLETE) {
					return;
				}
			}

			var same = signal.equals(value) && !error && (signal.f & ERROR_VALUE) === 0;
			merge_target(batch).capture(signal, error ?? value, same, !!error);

			if (runner !== null) {
				// Let the script consume the first value in this batch's view before releasing buffered results.
				runner.switch(batch);

				runner.continued.push(() => flush_waiting(true));

				runner = null;
			}

			onready?.(error);
			onready = undefined;

			if (DEV && location !== undefined && !signal.equals(value)) {
				recent_async_deriveds.add(signal);

				setTimeout(() => {
					if (recent_async_deriveds.has(signal) && (effect.f & DESTROYED) === 0) {
						w.await_waterfall(/** @type {string} */ (signal.label), location);
						recent_async_deriveds.delete(signal);
					}
				});
			}
		};

		d.promise.then(handler, (e) => handler(null, e || 'unknown'));
	});

	teardown(() => {
		for (const d of deferreds) {
			d.reject(OBSOLETE);
		}
	});

	return signal;
}

/**
 * @template V
 * @param {() => V | Promise<V>} fn
 * @param {string} [label]
 * @param {string} [location] If provided, print a warning if the value is not read immediately after update
 * @returns {Promise<Source<V>>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function async_derived(fn, label, location) {
	if (!current_runner) {
		e.async_derived_orphan();
	}

	const runner = current_runner;
	const batch = /** @type {Batch} */ (current_batch);

	return new Promise((fulfil, reject) => {
		var source = async_expression(
			() => {
				var effect = /** @type {Effect} */ (active_effect);
				var target = merge_target(/** @type {Batch} */ (current_batch));

				if (runner.running && target !== batch && is_uninitialized(source)) {
					// Check all earlier expressions: assignments can initialize them out of order.
					for (var i = index - 1; i >= 0; i--) {
						var s = runner.signals[i];

						if (is_uninitialized(s)) {
							// re-run until we have a value
							get(s);

							var pending = /** @type {Batch} */ (current_batch).async_deriveds;
							pending.get(effect)?.reject(OBSOLETE);
							pending.delete(effect);
							return UNINITIALIZED;
						}
					}
				}

				return fn();
			},
			label,
			location,
			(error) => {
				if (error === undefined) fulfil(/** @type {Source<V>} */ (source));
				else reject(error);
			}
		);

		var index = runner.signals.push(source) - 1;
	});
}

/**
 * Whether the signal of an async expression has no value yet in the active view of the world
 * @param {Source} signal
 */
export function is_uninitialized(signal) {
	return (batch_values?.get(signal) ?? signal).v === UNINITIALIZED;
}

/**
 * @template V
 * @param {() => V} fn
 * @returns {Derived<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function user_derived(fn) {
	const d = derived(fn);

	if (!async_mode_flag) push_reaction_value(d);

	return d;
}

/**
 * @template V
 * @param {() => V} fn
 * @returns {Derived<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function derived_safe_equal(fn) {
	const signal = derived(fn);
	signal.equals = safe_equals;
	return signal;
}

/**
 * @param {Derived} derived
 * @returns {void}
 */
export function destroy_derived_effects(derived) {
	var effects = derived.effects;

	if (effects !== null) {
		derived.effects = null;

		for (var i = 0; i < effects.length; i += 1) {
			destroy_effect(/** @type {Effect} */ (effects[i]));
		}
	}
}

/**
 * The currently updating deriveds, used to detect infinite recursion
 * in dev mode and provide a nicer error than 'too much recursion'
 * @type {Derived[]}
 */
let stack = [];

/**
 * @template T
 * @param {Derived} derived
 * @returns {T}
 */
export function execute_derived(derived) {
	var prev_active_effect = active_effect;
	var parent = derived.parent;

	if (
		!is_destroying_effect &&
		parent !== null &&
		derived.v !== UNINITIALIZED && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
		(parent.f & (DESTROYED | INERT)) !== 0
	) {
		w.derived_inert();

		// (as if it ran — it can't change anymore)
		update_derived_status(derived);

		return derived.v;
	}

	// Check before pushing, so that a recursive call doesn't remove the outer evaluation from the stack.
	if (DEV && includes.call(stack, derived)) {
		e.derived_references_self();
	}

	set_active_effect(parent);

	var prev_eager_effects = eager_effects;

	if (DEV) {
		set_eager_effects(new Set());
		stack.push(derived);
	}

	try {
		destroy_derived_effects(derived);
		return update_reaction(derived);
	} finally {
		set_active_effect(prev_active_effect);

		if (DEV) {
			set_eager_effects(prev_eager_effects);
			stack.pop();
		}
	}
}

/**
 * Update the global state of a derived, adopting the active batch's run if its view has
 * become the real world (e.g. because a fork was committed), or re-evaluating it otherwise.
 * `signal` can be a source, too, which is cheaper than checking first (this is called for every dependency that
 * is checked): only reactions ever get a dirty status, so `is_dirty` returns `false` for a source right away
 * @param {Value} signal
 * @returns {void}
 */
export function update_derived(signal) {
	var derived = /** @type {Derived} */ (signal);

	if (!is_dirty(derived)) return;

	var records = view_batch?.records;
	var record = records?.get(derived);

	if (record !== undefined && is_current(record.deps, record.dv)) {
		/** @type {Map<Reaction, BatchRecord>} */ (records).delete(derived);
		promote_record(derived, record);
	} else {
		// (the result is stored by `update_dependencies`)
		execute_derived(derived);
	}
}

/**
 * The value of `derived` as the view of the world of the active batch sees it, with its version: an
 * assigned value that holds, or a run of it whose versions are what the view holds — a record in the
 * batch, or the derived itself (i.e. its global state) — or else a new run. Results are cached for the
 * lifetime of the view (see `view_cache`), unless the derived is disconnected, in which case nothing
 * would remove them from the cache when they become stale.
 * @param {Derived} derived
 * @returns {Derived | DerivedRecord | BatchValue}
 */
export function get_view(derived) {
	var cache = /** @type {Map<Derived, Derived | DerivedRecord | BatchValue>} */ (view_cache);
	var entry = cache.get(derived);

	if (entry !== undefined) return entry;

	var batch = /** @type {Batch} */ (view_batch);

	// What the view holds for the derived is a write to it — an assignment (in this batch, or made while it commits),
	// or the value from before another batch's assignment that this view undoes — or else its global state. An assigned value
	// holds until one of the derived's dependencies — what its run in this view (its record in the batch, if
	// any, else its global run) read — is written after it (see `changed_since`). The value from before an
	// undone assignment is only used if it was assigned, too: a computed value was computed in some other
	// view of the world, and may depend on writes that this view undoes
	var written = /** @type {Map<Value, BatchValue>} */ (batch_values).get(derived);
	var held = written ?? derived;
	var assigned = written === undefined ? (derived.f & ASSIGNED) !== 0 : written.assigned;
	var record = /** @type {DerivedRecord | undefined} */ (batch.get_record(derived));

	if (assigned && !changed_since((record ?? derived).deps, held.wv)) {
		entry = held;
	} else if (record !== undefined && is_current(record.deps, record.dv)) {
		entry = record;
	} else if (
		written === undefined &&
		!assigned &&
		derived.dv !== null &&
		is_current(derived.deps, derived.dv)
	) {
		entry = derived;
	} else {
		execute_derived(derived);

		// the run is stored in the batch, unless it is the real-world value (see `update_record`)
		entry = /** @type {DerivedRecord | undefined} */ (batch.records?.get(derived)) ?? derived;
	}

	if ((derived.f & CONNECTED) !== 0) {
		cache.set(derived, entry);
	}

	return entry;
}

/**
 * @param {Derived} derived
 */
export function freeze_derived_effects(derived) {
	if (derived.effects === null) return;

	for (const e of derived.effects) {
		// if the effect has a teardown function or abort signal, call it
		if (e.teardown || (e.f & HAS_ABORT_CONTROLLER) !== 0) {
			e.teardown?.();
			abort_all(e);

			// make it a noop so it doesn't get called again if the derived
			// is unfrozen. we don't set it to `null`, because the existence
			// of a teardown function is what determines whether the
			// effect runs again during unfreezing (but not for teardown-only effects)
			if (e.fn !== null) e.teardown = noop;

			remove_reactions(e);
			destroy_effect_children(e);
		}
	}
}

/**
 * @param {Derived} derived
 */
export function unfreeze_derived_effects(derived) {
	if (derived.effects === null) return;

	for (const e of derived.effects) {
		// if the effect was previously frozen — indicated by the presence
		// of a teardown function — unfreeze it
		if (e.teardown && e.fn !== null) {
			update_effect(e);
		}
	}
}
