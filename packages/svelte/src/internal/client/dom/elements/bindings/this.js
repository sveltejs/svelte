import { STATE_SYMBOL } from '../../../constants.js';
import { branch, effect, render_effect } from '../../../reactivity/effects.js';
import {
	current_effect,
	current_reaction,
	set_current_effect,
	set_current_reaction,
	untrack
} from '../../../runtime.js';

/**
 * @param {any} bound_value
 * @param {Element} element_or_component
 * @returns {boolean}
 */
function is_bound_this(bound_value, element_or_component) {
	// Find the original target if the value is proxied.
	var proxy_target = bound_value && bound_value[STATE_SYMBOL]?.t;
	return bound_value === element_or_component || proxy_target === element_or_component;
}

/**
 * @param {Element} element_or_component
 * @param {(value: unknown, ...parts: unknown[]) => void} update
 * @param {(...parts: unknown[]) => unknown} get_value
 * @param {() => unknown[]} [get_parts] Set if the this binding is used inside an each block,
 * 										returns all the parts of the each block context that are used in the expression
 * @returns {void}
 */
export function bind_this(element_or_component, update, get_value, get_parts) {
	effect(() => {
		/** @type {unknown[]} */
		var old_parts;

		/** @type {unknown[]} */
		var parts;

		render_effect(() => {
			old_parts = parts;
			// We only track changes to the parts, not the value itself to avoid unnecessary reruns.
			parts = get_parts?.() || [];

			untrack(() => {
				if (element_or_component !== get_value(...parts)) {
					update(element_or_component, ...parts);
					// If this is an effect rerun (cause: each block context changes), then nullfiy the binding at
					// the previous position if it isn't already taken over by a different effect.
					if (old_parts && is_bound_this(get_value(...old_parts), element_or_component)) {
						update(null, ...old_parts);
					}
				}
			});
		});

		return () => {
			const previous_effect = current_effect;
			const previous_reaction = current_reaction;
			// TODO: maybe we should use something other an effect branch here to emulate the microtask behaviour.
			set_current_effect(null);
			set_current_reaction(null);
			branch(() => {
				if (parts && is_bound_this(get_value(...parts), element_or_component)) {
					update(null, ...parts);
				}
			});
			set_current_effect(previous_effect);
			set_current_reaction(previous_reaction);
		};
	});
}
