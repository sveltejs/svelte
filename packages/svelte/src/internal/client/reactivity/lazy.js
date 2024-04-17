import { is_array } from '../utils.js';

/**
 * @param {Array<unknown[] | { get: () => unknown, set: (v: unknown) => unknown }>} parts
 * @returns {unknown[]}
 */
export function lazy_array(...parts) {
	const arr = [];

	for (var i = 0; i < parts.length; i++) {
		var part = parts[i];

		if (is_array(part)) {
			arr.push(...part);
		} else {
			Object.defineProperty(arr, arr.length, {
				enumerable: true,
				...part
			});
		}
	}

	return arr;
}
