import { hydrating, set_hydrating } from '../hydration.js';
import { check_rich_option_support, create_comment, create_text } from '../operations.js';

/**
 * Handles rich HTML content inside `<option>` elements with browser-specific branching.
 * Modern browsers preserve HTML inside options, while older browsers strip it to text only.
 *
 * @param {HTMLOptionElement} option The `<option>` element to process
 * @param {() => void} rich_fn Function to process rich HTML content (modern browsers)
 */
export function rich_option(option, rich_fn) {
	var was_hydrating = hydrating;
	if (!check_rich_option_support()) {
		set_hydrating(false);
		option.textContent = '';
		option.append(create_comment(''));
	}
	try {
		rich_fn();
	} finally {
		set_hydrating(was_hydrating);
	}
}
