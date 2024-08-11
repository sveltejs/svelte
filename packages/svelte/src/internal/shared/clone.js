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
	if (DEV) {
		/** @type {string[]} */
		const paths = [];

		const copy = clone(value, new Map(), '', paths);
		if (paths.length === 1 && paths[0] === '' && !skip_warning) {
			// value could not be cloned
			w.state_snapshot_uncloneable();
		} else if (paths.length > 0 && !skip_warning) {
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
 * @returns {Snapshot<T>}
 */
function clone(value, cloned, path, paths) {
	if (typeof value === 'object' && value !== null) {
		const unwrapped = cloned.get(value);
		if (unwrapped !== undefined) return unwrapped;

		if (is_array(value)) {
			const copy = /** @type {Snapshot<any>} */ ([]);
			cloned.set(value, copy);

			for (let i = 0; i < value.length; i += 1) {
				copy.push(clone(value[i], cloned, DEV ? `${path}[${i}]` : path, paths));
			}

			return copy;
		}

		if (get_prototype_of(value) === object_prototype) {
			/** @type {Snapshot<any>} */
			const copy = {};
			cloned.set(value, copy);

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
				paths
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
