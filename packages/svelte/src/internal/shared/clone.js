/** @import { Snapshot } from './types' */
import { DEV } from 'esm-env';
import * as w from './warnings.js';
import { get_prototype_of, is_array, object_prototype } from './utils.js';

/**
 * In dev, we keep track of which properties could not be cloned. In prod
 * we don't bother, but we keep a dummy array around so that the
 * signature stays the same
 * @type {string[]}
 */
const empty = [];

/**
 * @template T
 * @param {T} value
 * @param {boolean} [skip_warning]
 * @returns {Snapshot<T>}
 */
export function snapshot(value, skip_warning = false) {
	if (DEV && !skip_warning) {
		/** @type {string[]} */
		const paths = [];

		const copy = clone(value, new Map(), '', paths);
		if (paths.length === 1 && paths[0] === '') {
			// value could not be cloned
			w.state_snapshot_uncloneable();
		} else if (paths.length > 0) {
			// some properties could not be cloned
			const slice = paths.length > 10 ? paths.slice(0, 7) : paths.slice(0, 10);
			const excess = paths.length - slice.length;

			let uncloned = slice.map((path) => `- <value>${path}`).join('\n');
			if (excess > 0) uncloned += `\n- ...and ${excess} more`;

			w.state_snapshot_uncloneable(uncloned);
		}

		return copy;
	}

	return clone(value, new Map(), '', empty);
}

/**
 * @template T
 * @param {T} value
 * @param {Map<T, Snapshot<T>>} cloned
 * @param {string} path
 * @param {string[]} paths
 * @param {null | T} original The original value, if `value` was produced from a `toJSON` call
 * @returns {Snapshot<T>}
 */
function clone(value, cloned, path, paths, original = null) {
	if (typeof value === 'object' && value !== null) {
		var unwrapped = cloned.get(value);
		if (unwrapped !== undefined) return unwrapped;

		if (value instanceof Map) return /** @type {Snapshot<T>} */ (new Map(value));
		if (value instanceof Set) return /** @type {Snapshot<T>} */ (new Set(value));

		if (is_array(value)) {
			var copy = /** @type {Snapshot<any>} */ (Array(value.length));
			cloned.set(value, copy);

			if (original !== null) {
				cloned.set(original, copy);
			}

			for (var i = 0; i < value.length; i += 1) {
				var element = value[i];
				if (i in value) {
					copy[i] = clone(element, cloned, DEV ? `${path}[${i}]` : path, paths);
				}
			}

			return copy;
		}

		if (get_prototype_of(value) === object_prototype) {
			/** @type {Snapshot<any>} */
			copy = {};
			cloned.set(value, copy);

			if (original !== null) {
				cloned.set(original, copy);
			}

			for (var key in value) {
				// @ts-expect-error
				copy[key] = clone(value[key], cloned, DEV ? `${path}.${key}` : path, paths);
			}

			return copy;
		}

		if (value instanceof Date) {
			return /** @type {Snapshot<T>} */ (structuredClone(value));
		}

		if (typeof (/** @type {T & { toJSON?: any } } */ (value).toJSON) === 'function') {
			return clone(
				/** @type {T & { toJSON(): any } } */ (value).toJSON(),
				cloned,
				DEV ? `${path}.toJSON()` : path,
				paths,
				// Associate the instance with the toJSON clone
				value
			);
		}
	}

	if (value instanceof EventTarget) {
		// can't be cloned
		return /** @type {Snapshot<T>} */ (value);
	}

	try {
		return /** @type {Snapshot<T>} */ (structuredClone(value));
	} catch (e) {
		if (DEV) {
			paths.push(path);
		}

		return /** @type {Snapshot<T>} */ (value);
	}
}
