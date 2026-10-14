import { listen, without_reactive_context } from './shared.js';

/**
 * @param {(activeElement: Element | null) => void} update
 * @returns {void}
 */
export function bind_active_element(update) {
	listen(document, ['focusin', 'focusout'], (event) => {
		if (event && event.type === 'focusout' && /** @type {FocusEvent} */ (event).relatedTarget) {
			// The tests still pass if we remove this, because of JSDOM limitations, but it is necessary
			// to avoid temporarily resetting to `document.body`
			return;
		}

		// Removing the focused element fires `focusout` while an effect is running
		without_reactive_context(() => update(document.activeElement));
	});
}
