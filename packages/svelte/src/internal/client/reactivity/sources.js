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
	ASSIGNED
} from '#client/constants';
import * as e from '../errors.js';
import { legacy_mode_flag, tracing_mode_flag } from '../../flags/index.js';
import { tag_proxy } from '../dev/tracing.js';
import { get_error } from '../../shared/dev.js';
import { component_context, is_runes } from '../context.js';
import { Batch, legacy_updates, in_real_world } from './batch.js';
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

export let eager_effects_deferred = false;

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
 * @template V
 * @param {Value<V>} source
 * @param {V} value
 * @param {Effect[] | null} [updated_during_traversal]
 * @returns {V}
 */
export function internal_set(source, value, updated_during_traversal = null) {
	if (!source.equals(value)) {
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

		batch.capture(source, value, false, false, updated_during_traversal);

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


	}

	return value;
}

export function flush_eager_effects() {
	eager_effects_deferred = false;

	// eager effects run in the real world, not in the view of a batch
	in_real_world(run_eager_effects);
}

function run_eager_effects() {
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
