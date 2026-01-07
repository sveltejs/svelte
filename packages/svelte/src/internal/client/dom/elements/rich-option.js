import { check_rich_option_support } from '../operations.js';

/**
 * Handles rich HTML content inside `<option>` elements with browser-specific branching.
 * Modern browsers preserve HTML inside options, while older browsers strip it to text only.
 *
 * @param {() => void} rich_fn Function to process rich HTML content (modern browsers)
 * @param {() => void} text_fn Function to process text-only content (legacy browsers)
 */
export function rich_option(rich_fn, text_fn) {
	if (check_rich_option_support()) {
		rich_fn();
	} else {
		text_fn();
	}
}
