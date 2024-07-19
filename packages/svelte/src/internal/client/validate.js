import { dev_current_component_function, untrack } from './runtime.js';
import { get_descriptor, is_array } from '../shared/utils.js';
import * as e from './errors.js';
import { FILENAME } from '../../constants.js';
import { render_effect } from './reactivity/effects.js';
import * as w from './warnings.js';

/** regex of all html void element names */
const void_element_names =
	/^(?:area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/;

/** @param {string} tag */
function is_void(tag) {
	return void_element_names.test(tag) || tag.toLowerCase() === '!doctype';
}

/**
 * @template Component
 * @param {() => Component} component_fn
 * @returns {Component}
 */
export function validate_dynamic_component(component_fn) {
	try {
		const instance = component_fn();

		if (instance !== undefined && typeof instance !== 'object') {
			e.svelte_component_invalid_this_value();
		}

		return instance;
	} catch (err) {
		const { message } = /** @type {Error} */ (err);

		if (typeof message === 'string' && message.indexOf('is not a function') !== -1) {
			e.svelte_component_invalid_this_value();
		}

		throw err;
	}
}

/**
 * @param {() => any} collection
 * @param {(item: any, index: number) => string} key_fn
 * @returns {void}
 */
export function validate_each_keys(collection, key_fn) {
	const keys = new Map();
	const maybe_array = untrack(() => collection());
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
			let k = String(array[i]);
			if (k.startsWith('[object ')) k = null;

			e.each_key_duplicate(a, b, k);
		}
		keys.set(key, i);
	}
}

/**
 * @param {Record<string, any>} $$props
 * @param {string[]} bindable
 * @param {string[]} exports
 * @param {Function & { [FILENAME]: string }} component
 */
export function validate_prop_bindings($$props, bindable, exports, component) {
	for (const key in $$props) {
		var setter = get_descriptor($$props, key)?.set;
		var name = component.name;

		if (setter) {
			if (exports.includes(key)) {
				e.bind_invalid_export(component[FILENAME], key, name);
			}

			if (!bindable.includes(key)) {
				e.bind_not_bindable(key, component[FILENAME], name);
			}
		}
	}
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

		var object = get_object();
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
			var location = filename && `${filename}:${line}:${column}`;
			w.binding_property_non_reactive(binding, location);

			warned = true;
		}
	});
}
