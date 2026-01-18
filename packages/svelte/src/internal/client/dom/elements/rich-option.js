import { hydrating, reset, set_hydrate_node, set_hydrating } from '../hydration.js';
import { create_comment } from '../operations.js';

/** @type {boolean | null} */
let supported = null;

/**
 * Checks if the browser supports rich HTML content inside `<option>` elements.
 * Modern browsers preserve HTML elements inside options, while older browsers
 * strip them during parsing, leaving only text content.
 * @returns {boolean}
 */
function support_customizable_select() {
	if (supported === null) {
		var select = document.createElement('select');
		select.innerHTML = '<option><span>t</span></option>';
		supported = /** @type {Element} */ (select.firstChild)?.firstChild?.nodeType === 1;
	}

	return supported;
}

/**
 * Handles rich HTML content inside `<option>`, `<optgroup>`, or `<select>` elements with browser-specific branching.
 * Modern browsers preserve HTML inside options, while older browsers strip it to text only.
 *
 * @param {HTMLOptionElement | HTMLOptGroupElement | HTMLSelectElement} element The element to process
 * @param {() => void} rich_fn Function to process rich HTML content (modern browsers)
 */
export function customizable_select_element(element, rich_fn) {
	var was_hydrating = hydrating;

	if (!support_customizable_select()) {
		set_hydrating(false);
		element.textContent = '';
		element.append(create_comment(''));
	}

	try {
		rich_fn();
	} finally {
		if (was_hydrating) {
			if (hydrating) {
				reset(element);
			} else {
				set_hydrating(true);
				set_hydrate_node(element);
			}
		}
	}
}
