import { render_effect } from '../../../reactivity/effects.js';

/**
 * Fires the handler once immediately (unless corresponding arg is set to `false`),
 * then listens to the given events until the render effect context is destroyed
 * @param {Element | Window} target
 * @param {Array<string>} events
 * @param {() => void} handler
 * @param {any} call_handler_immediately
 */
export function listen(target, events, handler, call_handler_immediately = true) {
	if (call_handler_immediately) {
		handler();
	}

	for (var name of events) {
		target.addEventListener(name, handler);
	}

	render_effect(() => {
		return () => {
			for (var name of events) {
				target.removeEventListener(name, handler);
			}
		};
	});
}

let listening_to_form_reset = false;

/**
 * Listen to the given event, and then instantiate a global form reset listener if not already done,
 * to notify all bindings when the form is reset
 * @param {HTMLElement} element
 * @param {string} event
 * @param {() => void} handler
 */
export function listen_to_event_and_reset_event(element, event, handler) {
	element.addEventListener(event, handler);
	// @ts-expect-error
	element.__on_reset = handler;

	if (!listening_to_form_reset) {
		listening_to_form_reset = true;
		document.addEventListener('reset', (evt) => {
			requestAnimationFrame(() => {
				if (!evt.defaultPrevented) {
					for (const e of /**@type {HTMLFormElement} */ (evt.target).elements) {
						// @ts-expect-error
						e.__on_reset?.();
					}
				}
			});
		});
	}
}
