import { STATE_SYMBOL } from '#client/constants';
import { sanitize_location } from '../../../utils.js';
import { untrack } from '../runtime.js';
import * as w from '../warnings.js';

/**
 *
 * @param {any} a
 * @param {any} b
 * @param {string} property
 * @param {string} location
 */
function compare(a, b, property, location) {
	if (a !== b && typeof b === 'object' && STATE_SYMBOL in b) {
		w.assignment_value_stale(property, /** @type {string} */ (sanitize_location(location)));
	}

	return a;
}

/**
 * @param {any} object
 * @param {string} property
 * @param {any} value
 * @param {string} location
 */
export function assign(object, property, value, location) {
	return compare(
		(object[property] = value),
		untrack(() => object[property]),
		property,
		location
	);
}

/**
 * @param {any} object
 * @param {string} property
 * @param {any} value
 * @param {string} location
 */
export function assign_and(object, property, value, location) {
	return compare(
		(object[property] &&= value),
		untrack(() => object[property]),
		property,
		location
	);
}

/**
 * @param {any} object
 * @param {string} property
 * @param {any} value
 * @param {string} location
 */
export function assign_or(object, property, value, location) {
	return compare(
		(object[property] ||= value),
		untrack(() => object[property]),
		property,
		location
	);
}

/**
 * @param {any} object
 * @param {string} property
 * @param {any} value
 * @param {string} location
 */
export function assign_nullish(object, property, value, location) {
	return compare(
		(object[property] ??= value),
		untrack(() => object[property]),
		property,
		location
	);
}
