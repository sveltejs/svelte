import { hydrating } from '../hydration.js';
import { render_effect } from '../../reactivity/effects.js';

/**
 * @param {HTMLElement} dom
 * @param {boolean} value
 * @returns {void}
 */
export function autofocus(dom, value) {
	if (value) {
		const body = document.body;
		dom.autofocus = true;
		render_effect(
			() => {
				if (document.activeElement === body) {
					dom.focus();
				}
			},
			true,
			false
		);
	}
}

/**
 * The child of a textarea actually corresponds to the defaultValue property, so we need
 * to remove it upon hydration to avoid a bug when someone resets the form value.
 * @param {HTMLTextAreaElement} dom
 * @returns {void}
 */
export function remove_textarea_child(dom) {
	if (hydrating && dom.firstChild !== null) {
		dom.textContent = '';
	}
}
