import { render_effect, teardown } from '../../../reactivity/effects.js';
import { listen } from './shared.js';

/**
 * @param {'innerHTML' | 'textContent' | 'innerText'} property
 * @param {HTMLElement} element
 * @param {() => unknown} get
 * @param {(value: unknown) => void} set
 * @returns {void}
 */
export function bind_content_editable(property, element, get, set = get) {
	element.addEventListener('input', () => {
		// @ts-ignore
		set(element[property]);
	});

	render_effect(() => {
		var value = get();

		if (element[property] !== value) {
			if (value == null) {
				// @ts-ignore
				var non_null_value = element[property];
				set(non_null_value);
			} else {
				// @ts-ignore
				element[property] = value + '';
			}
		}
	});
}

/**
 * @param {string} property
 * @param {string} event_name
 * @param {Element} element
 * @param {(value: unknown) => void} set
 * @param {() => unknown} [get]
 * @returns {void}
 */
export function bind_property(property, event_name, element, set, get) {
	var handler = () => {
		// @ts-ignore
		set(element[property]);
	};

	element.addEventListener(event_name, handler);

	if (get) {
		render_effect(() => {
			// @ts-ignore
			element[property] = get();
		});
	} else {
		handler();
	}

	// @ts-ignore
	if (element === document.body || element === window || element === document) {
		teardown(() => {
			element.removeEventListener(event_name, handler);
		});
	}
}

/**
 * Uses `show()` and `close()` to update the dialog, so that it is opened and closed
 * the same way as when calling those methods directly
 * @param {HTMLDialogElement} dialog
 * @param {() => unknown} get
 * @param {(value: unknown) => void} set
 * @returns {void}
 */
export function bind_dialog_open(dialog, get, set = get) {
	var handler = () => set(dialog.open);

	dialog.addEventListener('toggle', handler);
	// browsers without the toggle event for dialogs still fire close
	dialog.addEventListener('close', handler);

	render_effect(() => {
		var value = !!get();

		if (value === dialog.open) return;

		if (value) {
			dialog.show();
		} else {
			dialog.close();
		}
	});
}

/**
 * @param {HTMLElement} element
 * @param {(value: unknown) => void} set
 * @returns {void}
 */
export function bind_focused(element, set) {
	listen(element, ['focus', 'blur'], () => {
		set(element === document.activeElement);
	});
}
