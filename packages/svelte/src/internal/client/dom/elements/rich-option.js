import { hydrating, set_hydrating } from '../hydration.js';
import { check_rich_option_support, create_text } from '../operations.js';

/**
 * Handles rich HTML content inside `<option>` elements with browser-specific branching.
 * Modern browsers preserve HTML inside options, while older browsers strip it to text only.
 *
 * @param {HTMLOptionElement} option The option element
 * @param {() => void} render Function to render the option content
 */
export function rich_option(option, render) {
	var dominated = !check_rich_option_support();
	var was_hydrating = hydrating;

	try {
		// If the browser doesn't support rich options, disable hydration to avoid
		// mismatches caused by the browser's parser mangling the server-rendered HTML
		if (dominated && was_hydrating) {
			set_hydrating(false);
			// Clear the mangled content and add an anchor for mounting
			option.textContent = '';
			option.appendChild(create_text());
		}

		render();
	} finally {
		if (was_hydrating) {
			set_hydrating(true);
		}
	}
}
