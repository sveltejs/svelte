import { render_effect } from '../../reactivity/effects.js';
import { hydrating } from '../hydration.js';
import { clear_text_content, get_first_child } from '../operations.js';
import { queue_micro_task } from '../task.js';

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
				Promise.resolve().then(() => {
					if (!evt.defaultPrevented) {
						for (const e of /**@type {HTMLFormElement} */ (evt.target).elements) {
							// @ts-expect-error
							e.__on_r?.();
						}
					}
				});
			},
			// In the capture phase to guarantee we get noticed of it (no possiblity of stopPropagation)
			{ capture: true }
		);
	}
}

/**
 * @param {string} text
 */
export function title(text) {
	render_effect(() => {
		const previous = document.title;
		document.title = text;

		return () => {
			document.title = previous;
		};
	});
}
