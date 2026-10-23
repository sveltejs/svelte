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
	REACTION_RAN,
	INERT,
	CONNECTED,
	ASSIGNED
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
	unchanged_since
} from '../runtime.js';
import { without_reactive_context } from '../dom/elements/bindings/shared.js';
import { equals, safe_equals } from './equality.js';
import * as e from '../errors.js';
import * as w from '../warnings.js';
import { async_effect, destroy_effect, destroy_effect_children, teardown } from './effects.js';
import { eager_effects, internal_set, set_eager_effects, source } from './sources.js';
import { get_error } from '../../shared/dev.js';
import { async_mode_flag, tracing_mode_flag } from '../../flags/index.js';
import { component_context } from '../context.js';
import { UNINITIALIZED } from '../../../constants.js';
import { batch_values, current_batch, view_batch, view_cache } from './batch.js';
import { async_collected, increment_pending, unset_context } from './async.js';
import { deferred, includes, noop } from '../../shared/utils.js';
import { update_derived_status } from './status.js';

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
 * @returns {Promise<Source<V>>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function async_derived(fn, label, location) {
	const parent = active_effect;

	if (parent === null) {
		e.async_derived_orphan();
	}

	// The content that awaits the first value (see `async_collected`)
	var collector = active_reaction === null ? async_collected : null;

	/**
	 * The batches that ran the async expression (and whose run isn't obsolete), and whether their run is done
	 * @type {Map<Batch, boolean>}
	 */
	var runs = new Map();

	/** Checks whether the run that the first value comes from is done, whenever a run settles (see below) */
	var check = noop;

	var promise = /** @type {Promise<V>} */ (/** @type {unknown} */ (undefined));
	var signal = source(/** @type {V} */ (UNINITIALIZED));

	if (DEV) signal.label = label ?? fn.toString();

	// only suspend in async deriveds created on initialisation
	var should_suspend = !active_reaction;

	/**
	 * The batch whose run the first value comes from, and whose view the code that awaits it continues in:
	 * the batch the derived is created in, unless its run becomes obsolete, or it's a fork and a real batch
	 * ran the expression, too (see `follow`)
	 * @type {Batch | null}
	 */
	var followed = current_batch;

	/** @type {Set<ReturnType<typeof deferred<V>>>} */
	var deferreds = new Set();

	async_effect(() => {
		var effect = /** @type {Effect} */ (active_effect);

		if (DEV) {
			reactivity_loss_tracker = { effect, effect_deps: new Set(), warned: false };
		}

		/** @type {ReturnType<typeof deferred<V>>} */
		var d = deferred();
		promise = d.promise;

		try {
			// If this code is changed at some point, make sure to still access the then property
			// of fn() to read any signals it might access, so that we track them as dependencies.
			// We call `unset_context` to undo any `save` calls that happen inside `fn()`
			Promise.resolve(fn())
				.then(d.resolve, (e) => {
					// if the promise was rejected by the user, via `getAbortSignal`, then
					// wait for a subsequent resolution instead of flushing the batch
					if (e !== STALE_REACTION) d.reject(e);
					else runs.delete(batch);
				})
				.finally(unset_context);
		} catch (error) {
			d.reject(error);
			unset_context();
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

		if (should_suspend) {
			// We only increment the batch's pending state for updates, not creation, otherwise we will decrement
			// to zero before the work that depends on this promise (e.g. a template effect) has initialized,
			// causing the batch to resolve prematurely. Unless content awaits it: then the decrement waits
			// for that (see below), and the batch must not commit before it has its own result.
			// (The boundary counts the first run through the content)
			if ((effect.f & REACTION_RAN) !== 0 || collector !== null) {
				var decrement_pending = increment_pending((effect.f & REACTION_RAN) !== 0);
			}

			batch.async_deriveds.get(effect)?.reject(OBSOLETE);
			deferreds.add(d);
			batch.async_deriveds.set(effect, d);
			runs.set(batch, false);
		}

		const waiting = collector?.created?.promise ?? null;

		/**
		 * @param {any} value
		 * @param {unknown} error
		 */
		const handler = (value, error = undefined) => {
			if (DEV) {
				reactivity_loss_tracker = null;
			}

			deferreds.delete(d);

			// A batch that was merged into another one continues as that one
			var target = batch;
			while (target.merged !== null) target = target.merged;

			if (should_suspend && (batch.async_deriveds.get(effect) === d || batch.merged !== null)) {
				runs.delete(batch);

				if (error !== OBSOLETE && runs.get(target) !== false) runs.set(target, true);
			}

			if (waiting !== null && error !== OBSOLETE && !target.merges_into(follow() ?? target)) {
				// A batch whose run is done isn't done with it until the content that awaits it exists, since the
				// content is created by the batch whose run the first value comes from. Then it re-validates the
				// content in its own view (before it can commit it, i.e. in the same go). Unless it's merged into
				// that batch once it's done: then it hands its results over to that batch's runs (see
				// `Batch#merge`), and must not wait for them
				waiting.then(() => {
					if (target.linked) target.revalidate(parent);
					decrement_pending?.();
				});
			} else {
				decrement_pending?.();
			}

			if (error === OBSOLETE) {
				check();
				return;
			}

			// write the result in the batch's view of the world
			target.activate();

			if (error) {
				// @ts-expect-error the error is the wrong type, but we don't care
				internal_set(signal, error, null, true, true);
			} else {
				if (DEV && location !== undefined && !signal.equals(value)) {
					recent_async_deriveds.add(signal);

					setTimeout(() => {
						if (recent_async_deriveds.has(signal) && (effect.f & DESTROYED) === 0) {
							w.await_waterfall(/** @type {string} */ (signal.label), location);
							recent_async_deriveds.delete(signal);
						}
					});
				}

				internal_set(signal, value, null, true);
			}

			target.deactivate();
			check();
		};

		d.promise.then(handler, (e) => handler(null, e || 'unknown'));
	});

	teardown(() => {
		for (const d of deferreds) {
			d.reject(OBSOLETE);
		}
	});

	if (DEV) {
		// add a flag that lets this be printed as a derived
		// when using `$inspect.trace()`
		signal.f |= ASYNC;
	}

	if (!should_suspend) {
		return new Promise((fulfil) => {
			/** @param {Promise<V>} p */
			function next(p) {
				function go() {
					if (p !== promise) {
						// if the effect re-runs before the initial promise
						// resolves, delay resolution until we have a value
						next(promise);
						return;
					}

					fulfil(signal);
				}

				p.then(go, go);
			}

			next(promise);
		});
	}

	/**
	 * The batch whose run the first value comes from (see `followed`). While it has a run, that one — unless it's
	 * a fork, and a real batch has a run, too: the fork's result isn't part of the real world, and it would show
	 * up there when a boundary that shows its pending snippet reveals the content, or when the real batch
	 * commits it. Otherwise a batch that committed, whose view is the real world (its run superseded the
	 * followed one's, see `Batch#release_records`), else the first real batch, else the first fork
	 */
	function follow() {
		while (followed !== null && !runs.has(followed) && followed.merged !== null) {
			followed = followed.merged;
		}

		/** @type {Batch | null} */
		var real = null;
		/** @type {Batch | null} */
		var committed = null;

		for (const b of runs.keys()) {
			if (b.is_fork) continue;
			real ??= b;
			if (b.committed) committed ??= b;
		}

		if (followed !== null && runs.has(followed) && (!followed.is_fork || real === null)) {
			return followed;
		}

		return (followed = committed ?? real ?? runs.keys().next().value ?? null);
	}

	return new Promise((fulfil) => {
		check = () => {
			if ((parent.f & DESTROYED) === 0) {
				var batch = follow();
				if (batch === null || !runs.get(batch)) return;

				// The code that awaits the value continues in that batch's view, see `flatten` and `run`
				if (collector !== null) collector.batch = batch;
			}

			check = noop;
			fulfil(signal);
		};
	});
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

	set_active_effect(parent);

	var prev_eager_effects = eager_effects;
	var recursive = DEV && includes.call(stack, derived);

	if (DEV) {
		set_eager_effects(new Set());

		// (pushed in any case, so that `finally` doesn't remove the outer evaluation from the stack)
		stack.push(derived);
	}

	try {
		if (DEV && recursive) {
			e.derived_references_self();
		}

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
 * Update the global state of `derived`, adopting the active batch's run if its view has
 * become the real world (e.g. because a fork was committed), or re-evaluating it otherwise
 * @param {Derived} derived
 * @returns {void}
 */
export function update_derived(derived) {
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

	// What the view holds for the derived is a write to it — an assignment in this batch, or the value from
	// before another batch's assignment that this view undoes — or else its global state. An assigned value
	// holds until one of the derived's dependencies — what its run in this view (its record in the batch, if
	// any, else its global run) read — is written after it (see `unchanged_since`). The value from before an
	// undone assignment is only used if it was assigned, too: a computed value was computed in some other
	// view of the world, and may depend on writes that this view undoes
	var written = /** @type {Map<Value, BatchValue>} */ (batch_values).get(derived);
	var held = written ?? derived;
	var assigned =
		written === undefined
			? (derived.f & ASSIGNED) !== 0
			: written === batch.current.get(derived) || written.assigned;
	var record = /** @type {DerivedRecord | undefined} */ (batch.get_record(derived));

	if (assigned && unchanged_since((record ?? derived).deps, held.wv)) {
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
		if (e.teardown || e.ac) {
			e.teardown?.();
			if (e.ac !== null) {
				without_reactive_context(() => {
					/** @type {AbortController} */ (e.ac).abort(STALE_REACTION);
					e.ac = null;
				});
			}

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
