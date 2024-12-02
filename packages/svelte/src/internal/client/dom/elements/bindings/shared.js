import { teardown } from '../../../reactivity/effects.js';
import {
	active_effect,
	active_reaction,
	set_active_effect,
	set_active_reaction
} from '../../../runtime.js';
import { add_form_reset_listener } from '../misc.js';

/**
 * Fires the handler once immediately (unless corresponding arg is set to `false`),
 * then listens to the given events until the render effect context is destroyed
 * @param {EventTarget} target
 * @param {Array<string>} events
 * @param {(event?: Event) => void} handler
 * @param {any} call_handler_immediately
 */
export function listen(target, events, handler, call_handler_immediately = true) {
	if (call_handler_immediately) {
		handler();
	}

	for (var name of events) {
		target.addEventListener(name, handler);
	}

	teardown(() => {
		for (var name of events) {
			target.removeEventListener(name, handler);
		}
	});
}

/**
 * @template T
 * @param {() => T} fn
 */
export function without_reactive_context(fn) {
	var previous_reaction = active_reaction;
	var previous_effect = active_effect;
	set_active_reaction(null);
	set_active_effect(null);
	try {
		return fn();
	} finally {
		set_active_reaction(previous_reaction);
		set_active_effect(previous_effect);
	}
}

/**
 * Listen to the given event, and then instantiate a global form reset listener if not already done,
 * to notify all bindings when the form is reset
 * @param {HTMLElement} element
 * @param {string} event
 * @param {() => void} handler
 * @param {() => void} [on_reset]
 */
export function listen_to_event_and_reset_event(element, event, handler, on_reset = handler) {
	element.addEventListener(event, () => without_reactive_context(handler));
	// @ts-expect-error
	const prev = element.__on_r;
	if (prev) {
		// special case for checkbox that can have multiple binds (group & checked)
		// @ts-expect-error
		element.__on_r = () => {
			prev();
			on_reset();
		};
	} else {
		// @ts-expect-error
		element.__on_r = on_reset;
	}

	add_form_reset_listener();
}
