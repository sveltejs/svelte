import { STATE_SYMBOL } from '../constants.js';
import { is_array } from '../utils.js';

/**
 * @template {any} T
 * @param {T} value
 * @param {Map<any, any>} values
 * @returns {T}
 */
export function snapshot(value, values = new Map()) {
	if (typeof value !== 'object' || value === null) {
		return value;
	}

	if (STATE_SYMBOL in value) {
		var unwrapped = /** @type {T} */ (values.get(value));
		if (unwrapped !== undefined) {
			return unwrapped;
		}

		if (is_array(value)) {
			var length = value.length;
			var array = Array(length);

			values.set(value, array);

			for (var i = 0; i < length; i += 1) {
				array[i] = snapshot(value[i], values);
			}

			return /** @type {T} */ (array);
		}

		/** @type {Record<string | symbol, any>} */
		var obj = {};
		values.set(value, obj);

		for (var [k, v] of Object.entries(value)) {
			obj[k] = snapshot(v, values);
		}

		return /** @type {T} */ (obj);
	}

	return value;
}
