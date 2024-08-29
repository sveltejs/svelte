import { STATE_SYMBOL } from '../constants.js';

export function monkey_patch_console() {
	for (const method of Object.keys(console)) {
		// @ts-expect-error
		const original = console[method];

		// @ts-expect-error
		console[method] = (...args) => {
			for (const arg of args) {
				if (contains_state_proxy(arg)) {
					// TODO make this a proper warning
					console.warn('contains state proxy!!!!');
					break;
				}
			}

			return original.apply(console, args);
		};
	}
}

/**
 * @param {any} value
 * @param {Set<any>} seen
 * @returns {boolean}
 */
function contains_state_proxy(value, seen = new Set()) {
	if (typeof value !== 'object' || value === null) return false;

	if (seen.has(value)) return false;
	seen.add(value);

	if (STATE_SYMBOL in value) {
		return true;
	}

	for (const key in value) {
		if (contains_state_proxy(value[key], seen)) {
			return true;
		}
	}
}
