/** @import { Derived, Effect, Reaction, Source, Value } from '#client' */
import { DEV } from 'esm-env';
import {
	active_reaction,
	active_effect,
	untracked_writes,
	get,
	schedule_effect,
	set_untracked_writes,
	set_signal_status,
	untrack,
	increment_write_version,
	update_effect,
	reaction_sources,
	set_reaction_sources,
	check_dirtiness,
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
	INSPECT_EFFECT,
	UNOWNED,
	MAYBE_DIRTY,
	BLOCK_EFFECT,
	ROOT_EFFECT,
	EFFECT_IS_UPDATING
} from '../constants.js';
import * as e from '../errors.js';
import { legacy_mode_flag, tracing_mode_flag } from '../../flags/index.js';
import { get_stack } from '../dev/tracing.js';
import { component_context, is_runes } from '../context.js';
import { proxy } from '../proxy.js';

export let inspect_effects = new Set();
export const old_values = new Map();

/**
 * @param {Set<any>} v
 */
export function set_inspect_effects(v) {
	inspect_effects = v;
}

/**
 * @template V
 * @param {V} v
 * @param {Error | null} [stack]
 * @returns {Source<V>}
 */
// TODO rename this to `state` throughout the codebase
export function source(v, stack) {
	/** @type {Value} */
	var signal = {
		f: 0, // TODO ideally we could skip this altogether, but it causes type errors
		v,
		reactions: null,
		equals,
		rv: 0,
		wv: 0
	};

	if (DEV && tracing_mode_flag) {
		signal.created = stack ?? get_stack('CreatedAt');
		signal.debug = null;
	}

	return signal;
}

/**
 * @template V
 * @param {V} v
 * @param {Error | null} [stack]
 */
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
export function mutable_source(initial_value, immutable = false) {
	const s = source(initial_value);
	if (!immutable) {
		s.equals = safe_equals;
	}

	// bind the signal to the component context, in case we need to
	// track updates to trigger beforeUpdate/afterUpdate callbacks
	if (legacy_mode_flag && component_context !== null && component_context.l !== null) {
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
 * @param {Source<V>} source
 * @param {V} value
 * @param {boolean} [should_proxy]
 * @returns {V}
 */
export function set(source, value, should_proxy = false) {
	if (
		active_reaction !== null &&
		!untracking &&
		is_runes() &&
		(active_reaction.f & (DERIVED | BLOCK_EFFECT)) !== 0 &&
		!reaction_sources?.includes(source)
	) {
		e.state_unsafe_mutation();
	}

	let new_value = should_proxy ? proxy(value, source) : value;

	return internal_set(source, new_value);
}

/**
 * @template V
 * @param {Source<V>} source
 * @param {V} value
 * @returns {V}
 */
export function internal_set(source, value) {
	if (!source.equals(value)) {
		var old_value = source.v;

		if (is_destroying_effect) {
			old_values.set(source, value);
		} else {
			old_values.set(source, old_value);
		}

		source.v = value;
		source.wv = increment_write_version();

		if (DEV && tracing_mode_flag) {
			source.updated = get_stack('UpdatedAt');
			if (active_effect != null) {
				source.trace_need_increase = true;
				source.trace_v ??= old_value;
			}
		}

		mark_reactions(source, DIRTY);

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

		if (DEV && inspect_effects.size > 0) {
			const inspects = Array.from(inspect_effects);

			for (const effect of inspects) {
				// Mark clean inspect-effects as maybe dirty and then check their dirtiness
				// instead of just updating the effects - this way we avoid overfiring.
				if ((effect.f & CLEAN) !== 0) {
					set_signal_status(effect, MAYBE_DIRTY);
				}
				if (check_dirtiness(effect)) {
					update_effect(effect);
				}
			}

			inspect_effects.clear();
		}
	}

	return value;
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
	return set(source, d === 1 ? ++value : --value);
}

/**
 * @param {Value} signal
 * @param {number} status should be DIRTY or MAYBE_DIRTY
 * @returns {void}
 */
function mark_reactions(signal, status) {
	var reactions = signal.reactions;
	if (reactions === null) return;

	var runes = is_runes();
	var length = reactions.length;

	for (var i = 0; i < length; i++) {
		var reaction = reactions[i];
		var flags = reaction.f;

		// Skip any effects that are already dirty
		if ((flags & DIRTY) !== 0) continue;

		// In legacy mode, skip the current effect to prevent infinite loops
		if (!runes && reaction === active_effect) continue;

		// Inspect effects need to run immediately, so that the stack trace makes sense
		if (DEV && (flags & INSPECT_EFFECT) !== 0) {
			inspect_effects.add(reaction);
			continue;
		}

		set_signal_status(reaction, status);

		// If the signal a) was previously clean or b) is an unowned derived, then mark it
		if ((flags & (CLEAN | UNOWNED)) !== 0) {
			if ((flags & DERIVED) !== 0) {
				mark_reactions(/** @type {Derived} */ (reaction), MAYBE_DIRTY);
			} else {
				schedule_effect(/** @type {Effect} */ (reaction));
			}
		}
	}
}
