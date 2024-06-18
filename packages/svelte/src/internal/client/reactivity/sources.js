import { DEV } from 'esm-env';
import {
	current_component_context,
	current_reaction,
	current_dependencies,
	current_effect,
	current_untracked_writes,
	get,
	is_runes,
	mark_reactions,
	schedule_effect,
	set_current_untracked_writes,
	set_signal_status,
	untrack,
	increment_version,
	execute_effect,
	inspect_effects
} from '../runtime.js';
import { equals, safe_equals } from './equality.js';
import { CLEAN, DERIVED, DIRTY, BRANCH_EFFECT } from '../constants.js';
import { UNINITIALIZED } from '../../../constants.js';
import * as e from '../errors.js';

/**
 * @template V
 * @param {V} v
 * @returns {import('#client').Source<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function source(v) {
	return {
		f: 0, // TODO ideally we could skip this altogether, but it causes type errors
		v,
		reactions: null,
		equals,
		version: 0
	};
}

/**
 * @template V
 * @param {V} initial_value
 * @returns {import('#client').Source<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function mutable_source(initial_value) {
	const s = source(initial_value);
	s.equals = safe_equals;

	// bind the signal to the component context, in case we need to
	// track updates to trigger beforeUpdate/afterUpdate callbacks
	if (current_component_context !== null && current_component_context.l !== null) {
		(current_component_context.l.s ??= []).push(s);
	}

	return s;
}

/**
 * @template V
 * @param {import('#client').Value<V>} source
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
 * @param {import('#client').Source<V>} source
 * @param {V} value
 * @returns {V}
 */
export function set(source, value) {
	var initialized = source.v !== UNINITIALIZED;

	if (
		initialized &&
		current_reaction !== null &&
		is_runes() &&
		(current_reaction.f & DERIVED) !== 0
	) {
		e.state_unsafe_mutation();
	}

	if (!source.equals(value)) {
		source.v = value;
		source.version = increment_version();

		mark_reactions(source, DIRTY, true);

		// If the current signal is running for the first time, it won't have any
		// reactions as we only allocate and assign the reactions after the signal
		// has fully executed. So in the case of ensuring it registers the reaction
		// properly for itself, we need to ensure the current effect actually gets
		// scheduled. i.e:
		//
		// $effect(() => x++)
		//
		// We additionally want to skip this logic when initialising store sources
		if (
			is_runes() &&
			initialized &&
			current_effect !== null &&
			(current_effect.f & CLEAN) !== 0 &&
			(current_effect.f & BRANCH_EFFECT) === 0
		) {
			if (current_dependencies !== null && current_dependencies.includes(source)) {
				set_signal_status(current_effect, DIRTY);
				schedule_effect(current_effect);
			} else {
				if (current_untracked_writes === null) {
					set_current_untracked_writes([source]);
				} else {
					current_untracked_writes.push(source);
				}
			}
		}

		if (DEV) {
			for (const effect of inspect_effects) {
				execute_effect(effect);
			}

			inspect_effects.clear();
		}
	}

	return value;
}
