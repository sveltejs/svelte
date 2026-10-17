import { hydrating } from '../hydration.js';
import { clear_text_content, get_first_child } from '../operations.js';
import { queue_micro_task } from '../task.js';
import { FORM_RESET_HANDLER } from '../../constants.js';

/**
 * @param {HTMLElement} dom
 * @param {boolean} value
 * @returns {void}
 */
export function autofocus(dom, value) {
	if (value) {
		const body = document.body;
		dom.autofocus = true;

		queue_micro_task(() => {
			if (document.activeElement === body) {
				dom.focus();
			}
		});
	}
}

/**
 * The child of a textarea actually corresponds to the defaultValue property, so we need
 * to remove it upon hydration to avoid a bug when someone resets the form value.
 * @param {HTMLTextAreaElement} dom
 * @returns {void}
 */
export function remove_textarea_child(dom) {
	if (hydrating && get_first_child(dom) !== null) {
		clear_text_content(dom);
	}
}

let listening_to_form_reset = false;

export function add_form_reset_listener() {
	if (!listening_to_form_reset) {
		listening_to_form_reset = true;
		document.addEventListener(
			'reset',
			(evt) => {
				// Needs to happen one tick later or else the dom properties of the form
				// elements have not updated to their reset values yet
				Promise.resolve().then(function reset() {
					// A reset triggered by user input (e.g. clicking a reset button) is dispatched with
					// no script on the stack, so the browser runs microtasks in between listeners, and
					// this one runs before the form's own listeners could call `preventDefault()`.
					// In that case wait until the event has finished dispatching
					if (evt.eventPhase !== Event.NONE) {
						setTimeout(reset);
						return;
					}

					if (!evt.defaultPrevented) {
						for (const e of /**@type {HTMLFormElement} */ (evt.target).elements) {
							/** @type {any} */ (e)[FORM_RESET_HANDLER]?.();
						}
					}
				});
			},
			// In the capture phase to guarantee we get noticed of it (no possibility of stopPropagation)
			{ capture: true }
		);
	}
}
