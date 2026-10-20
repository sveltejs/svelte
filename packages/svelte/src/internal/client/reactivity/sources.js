/** @import { Derived, Effect, Source, Value } from '#client' */
import { DEV } from 'esm-env';
import {
	active_reaction,
	active_effect,
	untracked_writes,
	get,
	set_untracked_writes,
	untrack,
	update_effect,
	current_sources,
	is_dirty,
	untracking,
	is_destroying_effect,
	push_reaction_value
} from '../runtime.js';
import { equals, safe_equals } from './equality.js';
import {
	CLEAN,
	DERIVED,
	DIRTY,
	BRANCH_EFFECT,
	EAGER_EFFECT,
	MAYBE_DIRTY,
	BLOCK_EFFECT,
	ROOT_EFFECT,
	ASYNC,
	ASSIGNED,
	ERROR_VALUE
} from '#client/constants';
import * as e from '../errors.js';
import { legacy_mode_flag, tracing_mode_flag } from '../../flags/index.js';
import { tag_proxy } from '../dev/tracing.js';
import { get_error } from '../../shared/dev.js';
import { component_context, is_runes } from '../context.js';
import {
	Batch,
	batch_values,
	view_cache,
	eager_block_effects,
	schedule_effect,
	legacy_updates
} from './batch.js';
import { proxy } from '../proxy.js';
import { execute_derived } from './deriveds.js';
import { set_signal_status, update_derived_status } from './status.js';

/** @type {Set<Effect>} */
export let eager_effects = new Set();

/** @type {Map<Value, any>} */
export const old_values = new Map();

/**
 * @param {Set<any>} v
 */
export function set_eager_effects(v) {
	eager_effects = v;
}

let eager_effects_deferred = false;

export function set_eager_effects_deferred() {
	eager_effects_deferred = true;
}

/**
 * @template V
 * @param {V} v
 * @param {Error | null} [stack]
 * @returns {Source<V>}
 */
// TODO rename this to `state` throughout the codebase
export function source(v, stack) {
	/** @type {Source<V>} */
	var signal = {
		f: 0,
		v,
		reactions: null,
		equals,
		rv: 0,
		wv: 0
	};

	if (DEV && tracing_mode_flag) {
		signal.created = stack ?? get_error('created at');
		signal.updated = null;
		signal.set_during_effect = false;
		signal.trace = null;
	}

	return signal;
}

/**
 * @template V
 * @param {V} v
 * @param {Error | null} [stack]
 */
/*#__NO_SIDE_EFFECTS__*/
export function state(v, stack) {
	const s = source(v, stack);

	push_reaction_value(s);

	return s;
}

/**
 * @template V
 * @param {V} initial_value
 * @param {boolean} [immutable]
 * @returns {Source<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function mutable_source(initial_value, immutable = false, trackable = true) {
	const s = source(initial_value);
	if (!immutable) {
		s.equals = safe_equals;
	}

	// bind the signal to the component context, in case we need to
	// track updates to trigger beforeUpdate/afterUpdate callbacks
	if (legacy_mode_flag && trackable && component_context !== null && component_context.l !== null) {
		(component_context.l.s ??= []).push(s);
	}

	return s;
}

/**
 * @template V
 * @param {Value<V>} source
 * @param {V} value
 */
export function mutate(source, value) {
	set(
		source,
		untrack(() => get(source))
	);
	return value;
}

/**
 * @template V
 * @param {Value<V>} source
 * @param {V} value
 * @param {boolean} [should_proxy]
 * @returns {V}
 */
export function set(source, value, should_proxy = false) {
	if (
		active_reaction !== null &&
		// since we are untracking the function inside `$inspect.with` we need to add this check
		// to ensure we error if state is set inside an inspect effect
		(!untracking || (active_reaction.f & EAGER_EFFECT) !== 0) &&
		is_runes() &&
		(active_reaction.f & (DERIVED | BLOCK_EFFECT | ASYNC | EAGER_EFFECT)) !== 0 &&
		(current_sources === null || !current_sources.has(source))
	) {
		e.state_unsafe_mutation();
	}

	let new_value = should_proxy ? proxy(value) : value;

	if (DEV) {
		tag_proxy(new_value, /** @type {string} */ (source.label));
	}

	return internal_set(source, new_value, legacy_updates);
}

/**
 * A set of signals we have already seen while traversing in mark_reactions.
 * Not always set to balance the common case of sources only having a couple
 * of (transitive) dependencies (where always creating a Set would be bad for perf)
 * with the edge case of extremely deep or wide dependency arrays with cycles.
 * @type {Set<any> | null}
 */
var seen = null;
/** Number of transitive dependencies, see {@link seen} for more info */
var count_deps = 0;

/**
 * @template V
 * @param {Value<V>} source
 * @param {V} value
 * @param {Effect[] | null} [updated_during_traversal]
 * @param {boolean} [own_result] Whether this is a result the current batch computed (i.e. an async
 * expression resolved). Such a value belongs to the batch even if nothing changes, and it is a change
 * if it differs from what the batch sees (even if it equals the real value)
 * @param {boolean} [error] Whether the value is an error (an async expression rejected), which is thrown when read
 * @returns {V}
 */
export function internal_set(
	source,
	value,
	updated_during_traversal = null,
	own_result = false,
	error = false
) {
	var view = own_result ? batch_values?.get(source) : undefined;
	// errors are never the same value
	var same = source.equals(value) && !error && (source.f & ERROR_VALUE) === 0;

	if (
		!same ||
		(view !== undefined && (view.e || !source.equals.call(/** @type {any} */ (view), value)))
	) {
		if (is_destroying_effect) {
			old_values.set(source, value);
		} else if (!old_values.has(source)) {
			// only record the value from before the first write in this flush, otherwise a
			// teardown would see the value from before whichever write happened to be last
			old_values.set(source, source.v);
		}

		var batch = Batch.ensure();

		// If we are assigning to a dirty derived we eagerly execute it to track the dependencies. (Not if
		// it's assigned already: it tracks them, and its flags don't tell whether the assignment still holds,
		// which is what other views see when they undo this one — see `is_dirty`)
		if ((source.f & (DERIVED | DIRTY | ASSIGNED)) === (DERIVED | DIRTY)) {
			execute_derived(/** @type {Derived} */ (source));
		}

		var latest = batch.capture(source, value, same, error);

		if (DEV) {
			if (tracing_mode_flag || active_effect !== null) {
				source.updated ??= new Map();

				// For performance reasons, when not using $inspect.trace, we only start collecting stack traces
				// after the same source has been updated more than 5 times in the same flush cycle.
				const count = (source.updated.get('')?.count ?? 0) + 1;
				source.updated.set('', { error: /** @type {any} */ (null), count });

				if (tracing_mode_flag || count > 5) {
					const error = get_error('updated at');

					if (error !== null) {
						let entry = source.updated.get(error.stack);

						if (!entry) {
							entry = { error, count: 0 };
							source.updated.set(error.stack, entry);
						}

						entry.count++;
					}
				}
			}

			if (active_effect !== null) {
				source.set_during_effect = true;
			}
		}

		if (latest && (source.f & DERIVED) !== 0) {
			// The assigned value holds until one of the derived's dependencies is written after it (see `unchanged_since`).
			// (Other assignments are part of the batch's writes only — a fork's become global when it's committed)
			source.f |= ASSIGNED;
			update_derived_status(/** @type {Derived} */ (source));
		}

		// For debugging, in case you want to know which reactions are being scheduled:
		// log_reactions(source);
		seen = null;
		count_deps = 0;
		mark_reactions(source, DIRTY, updated_during_traversal);
		seen = null;

		// It's possible that the current reaction might not have up-to-date dependencies
		// whilst it's actively running. So in the case of ensuring it registers the reaction
		// properly for itself, we need to ensure the current effect actually gets
		// scheduled. i.e: `$effect(() => x++)`
		if (
			is_runes() &&
			active_effect !== null &&
			(active_effect.f & CLEAN) !== 0 &&
			(active_effect.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0
		) {
			if (untracked_writes === null) {
				set_untracked_writes([source]);
			} else {
				untracked_writes.push(source);
			}
		}

		if (!batch.is_fork && eager_effects.size > 0 && !eager_effects_deferred) {
			flush_eager_effects();
		}
	} else if (own_result) {
		// an async expression resolved to what the batch (and the real world) sees — it still belongs to the batch
		Batch.ensure().capture(source, value, true);
	}

	return value;
}

export function flush_eager_effects() {
	eager_effects_deferred = false;

	for (const effect of eager_effects) {
		// Mark clean inspect-effects as maybe dirty and then check their dirtiness
		// instead of just updating the effects - this way we avoid overfiring.
		if ((effect.f & CLEAN) !== 0) {
			set_signal_status(effect, MAYBE_DIRTY);
		}

		let dirty;

		try {
			dirty = is_dirty(effect);
		} catch {
			// Dirty-checking can evaluate derived dependencies and throw in cases where
			// parent effects are about to destroy this eager effect. Run the effect so
			// its own error handling can deal with transient failures.
			dirty = true;
		}

		if (dirty) {
			update_effect(effect);
		}
	}

	eager_effects.clear();
}

/**
 * @template {number | bigint} T
 * @param {Source<T>} source
 * @param {1 | -1} [d]
 * @returns {T}
 */
export function update(source, d = 1) {
	var value = get(source);
	var result = d === 1 ? value++ : value--;

	set(source, value);

	// @ts-expect-error
	return result;
}

/**
 * @template {number | bigint} T
 * @param {Source<T>} source
 * @param {1 | -1} [d]
 * @returns {T}
 */
export function update_pre(source, d = 1) {
	var value = get(source);

	// @ts-expect-error
	// eslint-disable-next-line no-useless-assignment -- `++`/`--` used for return value, not side effect on `value`
	return set(source, d === 1 ? ++value : --value);
}

/**
 * Silently (without using `get`) increment a source
 * @param {Source<number>} source
 */
export function increment(source) {
	set(source, source.v + 1);
}

/**
 * @param {Value} signal
 * @param {number} status should be DIRTY or MAYBE_DIRTY
 * @param {Effect[] | null} updated_during_traversal
 * @returns {void}
 */
function mark_reactions(signal, status, updated_during_traversal) {
	var reactions = signal.reactions;
	if (reactions === null) return;

	var runes = is_runes();
	var length = reactions.length;

	count_deps += length;
	// Activate the `seen` Set if we think from the unusually high number of deps that
	// there might be cycles in the graph, to avoid repeated lookups for reactions
	// Example: https://github.com/sveltejs/svelte/issues/16658 has a graph with one source
	// reaching ~10000 distinct deriveds/effects each, resulting in 65 million walks through repeated visits.
	if (count_deps > 100000 && seen === null) seen = new Set();

	if (seen !== null) {
		if (seen.has(signal)) return;
		seen.add(signal);
	}

	for (var i = 0; i < length; i++) {
		var reaction = reactions[i];
		var flags = reaction.f;

		// In legacy mode, skip the current effect to prevent infinite loops
		if (!runes && reaction === active_effect) continue;

		var not_dirty = (flags & DIRTY) === 0;

		if ((flags & (EAGER_EFFECT | DERIVED)) !== 0) {
			// don't set a DIRTY reaction to MAYBE_DIRTY
			if (not_dirty) {
				set_signal_status(reaction, status);
			}

			if ((flags & EAGER_EFFECT) !== 0) {
				// Eager effects need to run immediately:
				// - for $inspect so that the stack trace makes sense
				// - for $state.eager because they might be without an effect parent
				eager_effects.add(/** @type {Effect} */ (reaction));
			} else {
				var derived = /** @type {Derived} */ (reaction);

				view_cache?.delete(derived);
				mark_reactions(derived, MAYBE_DIRTY, updated_during_traversal);
			}
		} else if (not_dirty) {
			var effect = /** @type {Effect} */ (reaction);

			if ((flags & BLOCK_EFFECT) !== 0 && eager_block_effects !== null) {
				// these run right away (see `flush_queued_effects`)
				set_signal_status(effect, status);
				eager_block_effects.add(effect);
			}

			if (updated_during_traversal !== null) {
				set_signal_status(effect, status);
				updated_during_traversal.push(effect);
			} else {
				// the status is applied when the batch is processed (see `Batch#schedule`)
				schedule_effect(effect, status);
			}
		}
	}
}
