import { STATE_SYMBOL } from './constants.js';
import {
	define_property,
	get_descriptors,
	get_prototype_of,
	is_array,
	object_prototype
} from './utils.js';

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
	if (typeof value === 'object' && value != null) {
		const unwrapped = cloned.get(value);
		if (unwrapped !== undefined) {
			return unwrapped;
		}

		if (is_array(value)) {
			/** @type {Record<string | symbol, any>} */
			const array = [];
			cloned.set(value, array);
			for (const element of value) {
				array.push(clone(element, cloned));
			}
			return array;
		} else if (get_prototype_of(value) === object_prototype) {
			/** @type {Record<string | symbol, any>} */
			const obj = {};
			const keys = Reflect.ownKeys(value);
			const descriptors = get_descriptors(value);
			cloned.set(value, obj);

			for (const key of keys) {
				if (key === STATE_SYMBOL) continue;
				if (descriptors[key].get) {
					define_property(obj, key, descriptors[key]);
				} else {
					/** @type {T} */
					const property = value[key];
					obj[key] = clone(property, cloned);
				}
			}

			return obj;
		}

		if (typeof value.toJSON === 'function') {
			return clone(value.toJSON(), cloned);
		}
	}

	return structuredClone(value);
}
