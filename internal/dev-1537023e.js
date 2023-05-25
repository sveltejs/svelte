'use strict';

var Component = require('./Component-9c4b98a2.js');

/** regex of all html void element names */
const void_element_names =
	/^(?:area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/;

/**
 * @param {string} name
 * @returns {boolean}
 */
function is_void(name) {
	return void_element_names.test(name) || name.toLowerCase() === '!doctype';
}

/**
 * @template T
 * @param {string} type
 * @param {T} detail
 * @returns {void}
 */
function dispatch_dev(type, detail) {
	document.dispatchEvent(
		Component.custom_event(type, { version: '4.0.0-next.0', ...detail }, { bubbles: true })
	);
}

/**
 * @param {Node} target
 * @param {Node} node
 * @returns {void}
 */
function append_dev(target, node) {
	dispatch_dev('SvelteDOMInsert', { target, node });
	Component.append(target, node);
}

/**
 * @param {Node} target
 * @param {Node} node
 * @returns {void}
 */
function append_hydration_dev(target, node) {
	dispatch_dev('SvelteDOMInsert', { target, node });
	Component.append_hydration(target, node);
}

/**
 * @param {Node} target
 * @param {Node} node
 * @param {Node} anchor
 * @returns {void}
 */
function insert_dev(target, node, anchor) {
	dispatch_dev('SvelteDOMInsert', { target, node, anchor });
	Component.insert(target, node, anchor);
}

/** @param {Node} target
 * @param {Node} node
 * @param {Node} anchor
 * @returns {void}
 */
function insert_hydration_dev(target, node, anchor) {
	dispatch_dev('SvelteDOMInsert', { target, node, anchor });
	Component.insert_hydration(target, node, anchor);
}

/**
 * @param {Node} node
 * @returns {void}
 */
function detach_dev(node) {
	dispatch_dev('SvelteDOMRemove', { node });
	Component.detach(node);
}

/**
 * @param {Node} before
 * @param {Node} after
 * @returns {void}
 */
function detach_between_dev(before, after) {
	while (before.nextSibling && before.nextSibling !== after) {
		detach_dev(before.nextSibling);
	}
}

/**
 * @param {Node} after
 * @returns {void}
 */
function detach_before_dev(after) {
	while (after.previousSibling) {
		detach_dev(after.previousSibling);
	}
}

/**
 * @param {Node} before
 * @returns {void}
 */
function detach_after_dev(before) {
	while (before.nextSibling) {
		detach_dev(before.nextSibling);
	}
}

/**
 * @param {Node} node
 * @param {string} event
 * @param {EventListenerOrEventListenerObject} handler
 * @param {boolean | AddEventListenerOptions | EventListenerOptions} options
 * @param {boolean} has_prevent_default
 * @param {boolean} has_stop_propagation
 * @param {boolean} has_stop_immediate_propagation
 * @returns {() => void}
 */
function listen_dev(
	node,
	event,
	handler,
	options,
	has_prevent_default,
	has_stop_propagation,
	has_stop_immediate_propagation
) {
	const modifiers =
		options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
	if (has_prevent_default) modifiers.push('preventDefault');
	if (has_stop_propagation) modifiers.push('stopPropagation');
	if (has_stop_immediate_propagation) modifiers.push('stopImmediatePropagation');
	dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
	const dispose = Component.listen(node, event, handler, options);
	return () => {
		dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
		dispose();
	};
}

/**
 * @param {Element} node
 * @param {string} attribute
 * @param {string} value
 * @returns {void}
 */
function attr_dev(node, attribute, value) {
	Component.attr(node, attribute, value);
	if (value == null) dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
	else dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
}

/**
 * @param {Element} node
 * @param {string} property
 * @param {any} value
 * @returns {void}
 */
function prop_dev(node, property, value) {
	node[property] = value;
	dispatch_dev('SvelteDOMSetProperty', { node, property, value });
}

/**
 * @param {HTMLElement} node
 * @param {string} property
 * @param {any} value
 * @returns {void}
 */
function dataset_dev(node, property, value) {
	node.dataset[property] = value;
	dispatch_dev('SvelteDOMSetDataset', { node, property, value });
}

/**
 * @param {Text} text
 * @param {unknown} data
 * @returns {void}
 */
function set_data_dev(text, data) {
	data = '' + data;
	if (text.data === data) return;
	dispatch_dev('SvelteDOMSetData', { node: text, data });
	text.data = /** @type {string} */ (data);
}

/**
 * @param {Text} text
 * @param {unknown} data
 * @returns {void}
 */
function set_data_contenteditable_dev(text, data) {
	data = '' + data;
	if (text.wholeText === data) return;
	dispatch_dev('SvelteDOMSetData', { node: text, data });
	text.data = /** @type {string} */ (data);
}

/**
 * @param {Text} text
 * @param {unknown} data
 * @param {string} attr_value
 * @returns {void}
 */
function set_data_maybe_contenteditable_dev(text, data, attr_value) {
	if (~Component.contenteditable_truthy_values.indexOf(attr_value)) {
		set_data_contenteditable_dev(text, data);
	} else {
		set_data_dev(text, data);
	}
}

/**
 * @returns {void} */
function validate_each_argument(arg) {
	if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
		let msg = '{#each} only iterates over array-like objects.';
		if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
			msg += ' You can use a spread to convert this iterable into an array.';
		}
		throw new Error(msg);
	}
}

/**
 * @returns {void} */
function validate_slots(name, slot, keys) {
	for (const slot_key of Object.keys(slot)) {
		if (!~keys.indexOf(slot_key)) {
			console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
		}
	}
}

/**
 * @param {unknown} tag
 * @returns {void}
 */
function validate_dynamic_element(tag) {
	const is_string = typeof tag === 'string';
	if (tag && !is_string) {
		throw new Error('<svelte:element> expects "this" attribute to be a string.');
	}
}

/**
 * @param {undefined | string} tag
 * @returns {void}
 */
function validate_void_dynamic_element(tag) {
	if (tag && is_void(tag)) {
		console.warn(`<svelte:element this="${tag}"> is self-closing and cannot have content.`);
	}
}

function construct_svelte_component_dev(component, props) {
	const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
	try {
		const instance = new component(props);
		if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
			throw new Error(error_message);
		}
		return instance;
	} catch (err) {
		const { message } = err;
		if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
			throw new Error(error_message);
		} else {
			throw err;
		}
	}
}

/**
 * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
 *
 * Can be used to create strongly typed Svelte components.
 *
 * ### Example:
 *
 * You have component library on npm called `component-library`, from which
 * you export a component called `MyComponent`. For Svelte+TypeScript users,
 * you want to provide typings. Therefore you create a `index.d.ts`:
 * ```ts
 * import { SvelteComponent } from "svelte";
 * export class MyComponent extends SvelteComponent<{foo: string}> {}
 * ```
 * Typing this makes it possible for IDEs like VS Code with the Svelte extension
 * to provide intellisense and to use the component like this in a Svelte file
 * with TypeScript:
 * ```svelte
 * <script lang="ts">
 * 	import { MyComponent } from "component-library";
 * </script>
 * <MyComponent foo={'bar'} />
 * ```
 * @template {Record<string, any>} [Props=any]
 * @template {Record<string, any>} [Events=any]
 * @template {Record<string, any>} [Slots=any]
 * @extends SvelteComponent<Props, Events>
 */
class SvelteComponentDev extends Component.SvelteComponent {
	/**
	 * For type checking capabilities only.
	 * Does not exist at runtime.
	 * ### DO NOT USE!
	 *
	 * @type {Props}
	 */
	
	/**
	 * For type checking capabilities only.
	 * Does not exist at runtime.
	 * ### DO NOT USE!
	 *
	 * @type {Events}
	 */
	
	/**
	 * For type checking capabilities only.
	 * Does not exist at runtime.
	 * ### DO NOT USE!
	 *
	 * @type {Slots}
	 */
	

	/** @param {import('./public.js').ComponentConstructorOptions<Props>} options */
	constructor(options) {
		if (!options || (!options.target && !options.$$inline)) {
			throw new Error("'target' is a required option");
		}
		super();
	}

	/** @returns {void} */
	$destroy() {
		super.$destroy();
		this.$destroy = () => {
			console.warn('Component was already destroyed'); // eslint-disable-line no-console
		};
	}

	/** @returns {void} */
	$capture_state() {}

	/** @returns {void} */
	$inject_state() {}
}
/**
 * @template {Record<string, any>} [Props=any]
 * @template {Record<string, any>} [Events=any]
 * @template {Record<string, any>} [Slots=any]
 * @deprecated Use `SvelteComponent` instead. See PR for more information: https://github.com/sveltejs/svelte/pull/8512
 * @extends SvelteComponentDev<Props, Events, Slots>
 */
class SvelteComponentTyped extends SvelteComponentDev {}

/** @returns {() => void} */
function loop_guard(timeout) {
	const start = Date.now();
	return () => {
		if (Date.now() - start > timeout) {
			throw new Error('Infinite loop detected');
		}
	};
}

exports.SvelteComponentDev = SvelteComponentDev;
exports.SvelteComponentTyped = SvelteComponentTyped;
exports.append_dev = append_dev;
exports.append_hydration_dev = append_hydration_dev;
exports.attr_dev = attr_dev;
exports.construct_svelte_component_dev = construct_svelte_component_dev;
exports.dataset_dev = dataset_dev;
exports.detach_after_dev = detach_after_dev;
exports.detach_before_dev = detach_before_dev;
exports.detach_between_dev = detach_between_dev;
exports.detach_dev = detach_dev;
exports.dispatch_dev = dispatch_dev;
exports.insert_dev = insert_dev;
exports.insert_hydration_dev = insert_hydration_dev;
exports.is_void = is_void;
exports.listen_dev = listen_dev;
exports.loop_guard = loop_guard;
exports.prop_dev = prop_dev;
exports.set_data_contenteditable_dev = set_data_contenteditable_dev;
exports.set_data_dev = set_data_dev;
exports.set_data_maybe_contenteditable_dev = set_data_maybe_contenteditable_dev;
exports.validate_dynamic_element = validate_dynamic_element;
exports.validate_each_argument = validate_each_argument;
exports.validate_slots = validate_slots;
exports.validate_void_dynamic_element = validate_void_dynamic_element;
