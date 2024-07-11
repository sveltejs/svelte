import { get_prototype_of, is_array, object_prototype } from './utils.js';

/**
 * @template T
 * @param {T} value
 * @returns {T}
 */
export function snapshot(value) {
	return /** @type {T} */ (
		clone(/** @type {import('#client').ProxyStateObject} */ (value), new Map())
	);
}

/**
 * @template {import('#client').ProxyStateObject} T
 * @param {T} value
 * @param {Map<T, Record<string | symbol, any>>} cloned
 * @returns {Record<string | symbol, any>}
 */
function clone(value, cloned) {
	if (typeof value === 'object' && value !== null) {
		const unwrapped = cloned.get(value);
		if (unwrapped !== undefined) return unwrapped;

		if (is_array(value)) {
			/** @type {Record<string | symbol, any>} */
			const copy = [];
			cloned.set(value, copy);

			for (const element of value) {
				copy.push(clone(element, cloned));
			}

			return copy;
		}

		if (get_prototype_of(value) === object_prototype) {
			/** @type {Record<string | symbol, any>} */
			const copy = {};
			cloned.set(value, copy);

			for (var key in value) {
				copy[key] = clone(value[key], cloned);
			}

			return copy;
		}

		if (typeof value.toJSON === 'function') {
			return clone(value.toJSON(), cloned);
		}
	}

	return structuredClone(value);
}
