import { custom_event, append, insert, detach, listen, attr } from './dom';
import { now, has_Symbol } from 'svelte/environment';
import { SvelteComponent } from './Component';

export function add_location_dev(element, file, line, column, char) {
	element.__svelte_meta = {
		loc: { file, line, column, char },
	};
}
export function dispatch_dev<T = any>(type: string, detail?: T) {
	document.dispatchEvent(custom_event(type, { version: __VERSION__, ...detail }));
}

export function append_dev(target: Node, node: Node) {
	dispatch_dev('SvelteDOMInsert', { target, node });
	append(target, node);
}

export function insert_dev(target: Node, node: Node, anchor?: Node) {
	dispatch_dev('SvelteDOMInsert', { target, node, anchor });
	insert(target, node, anchor);
}

export function detach_dev(node: Node) {
	dispatch_dev('SvelteDOMRemove', { node });
	detach(node);
}

export function detach_between_dev(before: Node, after: Node) {
	while (before.nextSibling && before.nextSibling !== after) {
		detach_dev(before.nextSibling);
	}
}

export function detach_before_dev(after: Node) {
	while (after.previousSibling) {
		detach_dev(after.previousSibling);
	}
}

export function detach_after_dev(before: Node) {
	while (before.nextSibling) {
		detach_dev(before.nextSibling);
	}
}

export function listen_dev(
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

	dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });

	const dispose = listen(node, event, handler, options);
	return () => {
		dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
		dispose();
	};
}

export function attr_dev(node: Element, attribute: string, value?: string) {
	attr(node, attribute, value);

	if (value == null) dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
	else dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
}

export function prop_dev(node: Element, property: string, value?: any) {
	node[property] = value;

	dispatch_dev('SvelteDOMSetProperty', { node, property, value });
}

export function dataset_dev(node: HTMLElement, property: string, value?: any) {
	node.dataset[property] = value;

	dispatch_dev('SvelteDOMSetDataset', { node, property, value });
}

export function set_data_dev(text, data) {
	data = '' + data;
	if (text.data === data) return;

	dispatch_dev('SvelteDOMSetData', { node: text, data });
	text.data = data;
}
export function loop_guard_dev(timeout) {
	const start = now();
	return () => {
		if (now() - start > timeout) {
			throw new Error(`Infinite loop detected`);
		}
	};
}
export function validate_store_dev(store, name) {
	if (store != null && typeof store.subscribe !== 'function') {
		throw new Error(
			`Could not subscribe to $${name}. A valid store is an object with a .subscribe method, consider setting ${name} to null if this is expected.`
		);
	}
}
export const is_array_like_dev = (arg) => {
	if (typeof arg !== 'string' && typeof arg === 'object' && !('length' in arg))
		throw new Error(
			`{#each} only iterates over Array-like Objects.${
				has_Symbol && Symbol.iterator in arg
					? ' Consider using a [...spread] to convert this iterable into an Array instead.'
					: ''
			}`
		);
};
export const check_duplicate_keys_dev = (ctx, list, get_context, get_key) => {
	const keys = new Set();
	for (let i = 0; i < list.length; i++) {
		const key = get_key(get_context(ctx, list, i));
		if (keys.has(key)) {
			throw new Error(`Cannot have duplicate keys in a keyed each`);
		}
		keys.add(key);
	}
};

type Props = Record<string, any>;
export interface SvelteComponentDev {
	$set(props?: Props): void;
	$on<T = any>(event: string, callback: (event: CustomEvent<T>) => void): () => void;
	$destroy(): void;
	[accessor: string]: any;
}

export class SvelteComponentDev extends SvelteComponent {
	constructor(options: {
		target: Element;
		anchor?: Element;
		props?: Props;
		hydrate?: boolean;
		intro?: boolean;
		$$inline?: boolean;
	}) {
		if (!options || (!options.target && !options.$$inline)) throw new Error(`'target' is a required option`);
		super();
	}
	$destroy() {
		super.$destroy();
		this.$destroy = () => {
			console.warn(`Component was already destroyed`); // eslint-disable-line no-console
		};
	}
	$capture_state() {}
	$inject_state() {}
}
