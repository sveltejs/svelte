/** @import { Snapshot } from './types' */
import { get_prototype_of, is_array, object_prototype } from './utils.js';

/**
 * @template T
 * @param {T} value
 * @returns {Snapshot<T>}
 */
export function snapshot(value) {
	return clone(value, new Map());
}

/**
 * @template T
 * @param {T} value
 * @param {Map<T, Snapshot<T>>} cloned
 * @returns {Snapshot<T>}
 */
function clone(value, cloned) {
	if (typeof value === 'object' && value !== null) {
		const unwrapped = cloned.get(value);
		if (unwrapped !== undefined) return unwrapped;

		if (is_array(value)) {
			const copy = /** @type {Snapshot<any>} */ ([]);
			cloned.set(value, copy);

			for (const element of value) {
				copy.push(clone(element, cloned));
			}

			return copy;
		}

		if (get_prototype_of(value) === object_prototype) {
			/** @type {Snapshot<any>} */
			const copy = {};
			cloned.set(value, copy);

			for (var key in value) {
				// @ts-expect-error
				copy[key] = clone(value[key], cloned);
			}

			return copy;
		}

		if (typeof (/** @type {T & { toJSON?: any } } */ (value).toJSON) === 'function') {
			return clone(/** @type {T & { toJSON(): any } } */ (value).toJSON(), cloned);
		}
	}

	return /** @type {Snapshot<T>} */ (structuredClone(value));
}
