/** @import { Derived, Effect, Reaction, Source, Value } from '#client' */
import { DEV } from 'esm-env';
import {
	current_component_context,
	current_reaction,
	new_deps,
	current_effect,
	current_untracked_writes,
	get,
	is_runes,
	schedule_effect,
	set_current_untracked_writes,
	set_signal_status,
	untrack,
	increment_version,
	update_effect,
	derived_sources,
	set_derived_sources,
	flush_sync,
	check_dirtiness
} from '../runtime.js';
import { equals, safe_equals } from './equality.js';
import {
	CLEAN,
	DERIVED,
	DIRTY,
	BRANCH_EFFECT,
	INSPECT_EFFECT,
	UNOWNED,
	MAYBE_DIRTY
} from '../constants.js';
import * as e from '../errors.js';

export let inspect_effects = new Set();

/**
 * @param {Set<any>} v
 */
export function set_inspect_effects(v) {
	inspect_effects = v;
}

/**
 * @template V
 * @param {V} v
 * @returns {Source<V>}
 */
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
 * @param {V} v
 */
export function state(v) {
	return push_derived_source(source(v));
}

/**
 * @template V
 * @param {V} initial_value
 * @returns {Source<V>}
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
 * @param {V} v
 * @returns {Source<V>}
 */
export function mutable_state(v) {
	return push_derived_source(mutable_source(v));
}

/**
 * @template V
 * @param {Source<V>} source
 */
/*#__NO_SIDE_EFFECTS__*/
function push_derived_source(source) {
	if (current_reaction !== null && (current_reaction.f & DERIVED) !== 0) {
		if (derived_sources === null) {
			set_derived_sources([source]);
		} else {
			derived_sources.push(source);
		}
	}

	return source;
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
 * @returns {V}
 */
export function set(source, value) {
	if (
		current_reaction !== null &&
		is_runes() &&
		(current_reaction.f & DERIVED) !== 0 &&
		// If the source was created locally within the current derived, then
		// we allow the mutation.
		(derived_sources === null || !derived_sources.includes(source))
	) {
		e.state_unsafe_mutation();
	}

	if (!source.equals(value)) {
		source.v = value;
		source.version = increment_version();

		mark_reactions(source, DIRTY);

		// If the current signal is running for the first time, it won't have any
		// reactions as we only allocate and assign the reactions after the signal
		// has fully executed. So in the case of ensuring it registers the reaction
		// properly for itself, we need to ensure the current effect actually gets
		// scheduled. i.e: `$effect(() => x++)`
		if (
			is_runes() &&
			current_effect !== null &&
			(current_effect.f & CLEAN) !== 0 &&
			(current_effect.f & BRANCH_EFFECT) === 0
		) {
			if (new_deps !== null && new_deps.includes(source)) {
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

		if (DEV && inspect_effects.size > 0) {
			const inspects = Array.from(inspect_effects);
			if (current_effect === null) {
				// Triggering an effect sync can tear the signal graph, so to avoid this we need
				// to ensure the graph has been flushed before triggering any inspect effects.
				// Only needed when there's currently no effect, and flushing with one present
				// could have other unintended consequences, like effects running out of order.
				// This is expensive, but given this is a DEV mode only feature, it should be fine
				flush_sync();
			}
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
		if (!runes && reaction === current_effect) continue;

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
