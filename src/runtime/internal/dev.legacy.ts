import { custom_event, append, insert, detach, listen, attr } from './dom';
import { now } from 'svelte/environment';
let inited;
export function add_location_dev$legacy(element, file, line, column, char) {
	element.__svelte_meta = {
		loc: { file, line, column, char },
	};
}
export function dispatch_dev$legacy<T = any>(type: string, detail?: T) {
	if (!inited && `__SVELTE_DEVTOOLS_GLOBAL_HOOK__` in window) {
		inited = true;
		throw new Error(`You must specify the version`);
	}
	document.dispatchEvent(custom_event(type, { version: __VERSION__, ...detail }));
}

export function append_dev$legacy(target: Node, node: Node) {
	dispatch_dev$legacy('SvelteDOMInsert', { target, node });
	append(target, node);
}

export function insert_dev$legacy(target: Node, node: Node, anchor?: Node) {
	dispatch_dev$legacy('SvelteDOMInsert', { target, node, anchor });
	insert(target, node, anchor);
}

export function detach_dev$legacy(node: Node) {
	dispatch_dev$legacy('SvelteDOMRemove', { node });
	detach(node);
}

export function detach_between_dev$legacy(before: Node, after: Node) {
	while (before.nextSibling && before.nextSibling !== after) {
		detach_dev$legacy(before.nextSibling);
	}
}

export function detach_before_dev$legacy(after: Node) {
	while (after.previousSibling) {
		detach_dev$legacy(after.previousSibling);
	}
}

export function detach_after_dev$legacy(before: Node) {
	while (before.nextSibling) {
		detach_dev$legacy(before.nextSibling);
	}
}

export function listen_dev$legacy(
	node: Node,
	event: string,
	handler: EventListenerOrEventListenerObject,
	options?: boolean | AddEventListenerOptions | EventListenerOptions,
	has_prevent_default?: boolean,
	has_stop_propagation?: boolean
) {
	const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
	if (has_prevent_default) modifiers.push('preventDefault');
	if (has_stop_propagation) modifiers.push('stopPropagation');

	dispatch_dev$legacy('SvelteDOMAddEventListener', { node, event, handler, modifiers });

	const dispose = listen(node, event, handler, options);
	return () => {
		dispatch_dev$legacy('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
		dispose();
	};
}

export function attr_dev$legacy(node: Element, attribute: string, value?: string) {
	attr(node, attribute, value);

	if (value == null) dispatch_dev$legacy('SvelteDOMRemoveAttribute', { node, attribute });
	else dispatch_dev$legacy('SvelteDOMSetAttribute', { node, attribute, value });
}

export function prop_dev$legacy(node: Element, property: string, value?: any) {
	node[property] = value;

	dispatch_dev$legacy('SvelteDOMSetProperty', { node, property, value });
}

export function dataset_dev$legacy(node: HTMLElement, property: string, value?: any) {
	node.dataset[property] = value;

	dispatch_dev$legacy('SvelteDOMSetDataset', { node, property, value });
}

export function set_data_dev$legacy(text, data) {
	data = '' + data;
	if (text.data === data) return;

	dispatch_dev$legacy('SvelteDOMSetData', { node: text, data });
	text.data = data;
}
export function loop_guard_dev$legacy(timeout) {
	const start = now();
	return () => {
		if (now() - start > timeout) {
			throw new Error(`Infinite loop detected`);
		}
	};
}
export function validate_store_dev$legacy(store, name) {
	if (store != null && typeof store.subscribe !== 'function') {
		throw new Error(`'${name}' is not a store with a 'subscribe' method`);
	}
}
