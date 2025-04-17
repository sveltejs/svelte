import { dev_current_component_function } from './context.js';
import { is_array } from '../shared/utils.js';
import * as e from './errors.js';
import { FILENAME } from '../../constants.js';
import { render_effect } from './reactivity/effects.js';
import * as w from './warnings.js';
import { capture_store_binding } from './reactivity/store.js';

/**
 * @param {() => any} collection
 * @param {(item: any, index: number) => string} key_fn
 * @returns {void}
 */
export function validate_each_keys(collection, key_fn) {
	render_effect(() => {
		const keys = new Map();
		const maybe_array = collection();
		const array = is_array(maybe_array)
			? maybe_array
			: maybe_array == null
				? []
				: Array.from(maybe_array);
		const length = array.length;
		for (let i = 0; i < length; i++) {
			const key = key_fn(array[i], i);
			if (keys.has(key)) {
				const a = String(keys.get(key));
				const b = String(i);

				/** @type {string | null} */
				let k = String(key);
				if (k.startsWith('[object ')) k = null;

				e.each_key_duplicate(a, b, k);
			}
			keys.set(key, i);
		}
	});
}

/**
 * @param {string} binding
 * @param {() => Record<string, any>} get_object
 * @param {() => string} get_property
 * @param {number} line
 * @param {number} column
 */
export function validate_binding(binding, get_object, get_property, line, column) {
	var warned = false;

	var filename = dev_current_component_function?.[FILENAME];

	render_effect(() => {
		if (warned) return;

		var [object, is_store_sub] = capture_store_binding(get_object);

		if (is_store_sub) return;

		var property = get_property();

		var ran = false;

		// by making the (possibly false, but it would be an extreme edge case) assumption
		// that a getter has a corresponding setter, we can determine if a property is
		// reactive by seeing if this effect has dependencies
		var effect = render_effect(() => {
			if (ran) return;

			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			object[property];
		});

		ran = true;

		if (effect.deps === null) {
			var location = `${filename}:${line}:${column}`;
			w.binding_property_non_reactive(binding, location);

			warned = true;
		}
	});
}
