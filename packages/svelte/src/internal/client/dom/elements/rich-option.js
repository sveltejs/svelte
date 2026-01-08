import { hydrating, set_hydrating } from '../hydration.js';
import { create_text } from '../operations.js';

/** @type {boolean | null} */
var supported = null;

/**
 * Checks if the browser supports rich HTML content inside `<option>` elements
 * @returns {boolean}
 */
function supports_customizable_select() {
	if (supported === null) {
		var s = document.createElement('select');
		supported = (s.innerHTML = '<option><span>x</span></option>') === s.innerHTML;
	}

	return supported;
}

/**
 * Handles rich HTML content inside `<option>` elements by disabling hydration
 * in browsers that don't support it, since the server-rendered HTML
 * will have been mangled by the browser's parser
 * @param {HTMLOptionElement} option
 * @param {() => void} render
 */
export function rich_option(option, render) {
	var was_hydrating = hydrating;

	try {
		if (!supports_customizable_select() && was_hydrating) {
			set_hydrating(false);
			// Clear the mangled content and add an anchor for mounting
			option.textContent = '';
			option.append(create_text());
		}

		render();
	} finally {
		if (was_hydrating) {
			set_hydrating(true);
		}
	}
}
