import { custom_event, append, insert, detach, listen, attr } from './dom';
import { SvelteComponent } from './Component';

export function dispatch_dev<T=any>(type: string, detail?: T) {
	document.dispatchEvent(custom_event(type, { version: '__VERSION__', ...detail }));
}

export function append_dev(target: Node, node: Node) {
	dispatch_dev("SvelteDOMInsert", { target, node });
	append(target, node);
}

export function insert_dev(target: Node, node: Node, anchor?: Node) {
	dispatch_dev("SvelteDOMInsert", { target, node, anchor });
	insert(target, node, anchor);
}

export function detach_dev(node: Node) {
	dispatch_dev("SvelteDOMRemove", { node });
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

export function listen_dev(node: Node, event: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | EventListenerOptions, has_prevent_default?: boolean, has_stop_propagation?: boolean) {
	const modifiers = options === true ? [ "capture" ] : options ? Array.from(Object.keys(options)) : [];
	if (has_prevent_default) modifiers.push('preventDefault');
	if (has_stop_propagation) modifiers.push('stopPropagation');

	dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });

	const dispose = listen(node, event, handler, options);
	return () => {
		dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
		dispose();
	};
}

export function attr_dev(node: Element, attribute: string, value?: string) {
	attr(node, attribute, value);

	if (value == null) dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
	else dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
}

export function prop_dev(node: Element, property: string, value?: any) {
	node[property] = value;

	dispatch_dev("SvelteDOMSetProperty", { node, property, value });
}

export function dataset_dev(node: HTMLElement, property: string, value?: any) {
	node.dataset[property] = value;

	dispatch_dev("SvelteDOMSetDataset", { node, property, value });
}

export function set_data_dev(text, data) {
	data = '' + data;
	if (text.data === data) return;

	dispatch_dev("SvelteDOMSetData", { node: text, data });
	text.data = data;
}

export function validate_each_argument(arg) {
	if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
		let msg = '{#each} only iterates over array-like objects.';
		if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
			msg += ' You can use a spread to convert this iterable into an array.';
		}
		throw new Error(msg);
	}
}


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
		if (!options || (!options.target && !options.$$inline)) {
			throw new Error(`'target' is a required option`);
		}

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

export function loop_guard(timeout) {
	const start = Date.now();
	return () => {
		if (Date.now() - start > timeout) {
			throw new Error(`Infinite loop detected`);
		}
	};
}
