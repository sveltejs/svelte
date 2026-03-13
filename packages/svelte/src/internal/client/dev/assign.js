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
 * @param {any} rhs
 * @param {string} location
 */
export function assign(object, property, rhs, location) {
	return compare(
		(object[property] = rhs),
		untrack(() => object[property]),
		property,
		location
	);
}

/**
 * @param {string} operator
 * @param {any} object
 * @param {string} property
 * @param {() => any} rhs_getter
 * @param {string} location
 */
export function assign_lazy(operator, object, property, rhs_getter, location) {
	return compare(
		operator === '&&='
			? (object[property] &&= rhs_getter())
			: operator === '||='
				? (object[property] ||= rhs_getter())
				: operator === '??='
					? (object[property] ??= rhs_getter())
					: null,
		untrack(() => object[property]),
		property,
		location
	);
}

/**
 * @param {string} operator
 * @param {any} object
 * @param {string} property
 * @param {() => any} rhs_getter
 * @param {string} location
 */
export async function assign_lazy_async(operator, object, property, rhs_getter, location) {
	return compare(
		operator === '&&='
			? (object[property] &&= await rhs_getter())
			: operator === '||='
				? (object[property] ||= await rhs_getter())
				: operator === '??='
					? (object[property] ??= await rhs_getter())
					: null,
		untrack(() => object[property]),
		property,
		location
	);
}
