import { custom_event, append, append_hydration, insert, insert_hydration, detach, listen, attr } from './dom';
import { SvelteComponent } from './Component';

export function dispatch_dev<T=any>(type: string, detail?: T) {
	document.dispatchEvent(custom_event(type, { version: '__VERSION__', ...detail }, true));
}

export function append_dev(target: Node, node: Node) {
	dispatch_dev('SvelteDOMInsert', { target, node });
	append(target, node);
}

export function append_hydration_dev(target: Node, node: Node) {
	dispatch_dev('SvelteDOMInsert', { target, node });
	append_hydration(target, node);
}

export function insert_dev(target: Node, node: Node, anchor?: Node) {
	dispatch_dev('SvelteDOMInsert', { target, node, anchor });
	insert(target, node, anchor);
}

export function insert_hydration_dev(target: Node, node: Node, anchor?: Node) {
	dispatch_dev('SvelteDOMInsert', { target, node, anchor });
	insert_hydration(target, node, anchor);
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

export function listen_dev(node: Node, event: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | EventListenerOptions, has_prevent_default?: boolean, has_stop_propagation?: boolean) {
	const modifiers = options === true ? [ 'capture' ] : options ? Array.from(Object.keys(options)) : [];
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
	if (text.wholeText === data) return;

	dispatch_dev('SvelteDOMSetData', { node: text, data });
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

export function validate_slots(name, slot, keys) {
	for (const slot_key of Object.keys(slot)) {
		if (!~keys.indexOf(slot_key)) {
			console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
		}
	}
}

type Props = Record<string, any>;
export interface SvelteComponentDev {
	$set(props?: Props): void;
	$on(event: string, callback: (event: any) => void): () => void;
	$destroy(): void;
	[accessor: string]: any;
}
interface IComponentOptions<Props extends Record<string, any> = Record<string, any>> {
	target: Element|ShadowRoot;
	anchor?: Element;
	props?: Props;
	context?: Map<any, any>;
	hydrate?: boolean;
	intro?: boolean;
	$$inline?: boolean;
}

/**
 * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
 */
export class SvelteComponentDev extends SvelteComponent {
	/**
	 * @private
	 * For type checking capabilities only.
	 * Does not exist at runtime.
	 * ### DO NOT USE!
	 */
	$$prop_def: Props;
	/**
	 * @private
	 * For type checking capabilities only.
	 * Does not exist at runtime.
	 * ### DO NOT USE!
	 */
	$$events_def: any;
	/**
	 * @private
	 * For type checking capabilities only.
	 * Does not exist at runtime.
	 * ### DO NOT USE!
	 */
	$$slot_def: any;

	constructor(options: IComponentOptions) {
		if (!options || (!options.target && !options.$$inline)) {
			throw new Error("'target' is a required option");
		}

		super();
	}

	$destroy() {
		super.$destroy();
		this.$destroy = () => {
			console.warn('Component was already destroyed'); // eslint-disable-line no-console
		};
	}

	$capture_state() {}

	$inject_state() {}
}

// TODO https://github.com/microsoft/TypeScript/issues/41770 is the reason
// why we have to split out SvelteComponentTyped to not break existing usage of SvelteComponent.
// Try to find a better way for Svelte 4.0.

export interface SvelteComponentTyped<
	Props extends Record<string, any> = any,
	Events extends Record<string, any> = any,
	Slots extends Record<string, any> = any // eslint-disable-line @typescript-eslint/no-unused-vars
> {
	$set(props?: Partial<Props>): void;
	$on<K extends Extract<keyof Events, string>>(type: K, callback: (e: Events[K]) => void): () => void;
	$destroy(): void;
	[accessor: string]: any;
}
/**
 * Base class to create strongly typed Svelte components.
 * This only exists for typing purposes and should be used in `.d.ts` files.
 *
 * ### Example:
 *
 * You have component library on npm called `component-library`, from which
 * you export a component called `MyComponent`. For Svelte+TypeScript users,
 * you want to provide typings. Therefore you create a `index.d.ts`:
 * ```ts
 * import { SvelteComponentTyped } from "svelte";
 * export class MyComponent extends SvelteComponentTyped<{foo: string}> {}
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
 *
 * #### Why not make this part of `SvelteComponent(Dev)`?
 * Because
 * ```ts
 * class ASubclassOfSvelteComponent extends SvelteComponent<{foo: string}> {}
 * const component: typeof SvelteComponent = ASubclassOfSvelteComponent;
 * ```
 * will throw a type error, so we need to separate the more strictly typed class.
 */
export class SvelteComponentTyped<
	Props extends Record<string, any> = any,
	Events extends Record<string, any> = any,
	Slots extends Record<string, any> = any
> extends SvelteComponentDev {
	/**
	 * @private
	 * For type checking capabilities only.
	 * Does not exist at runtime.
	 * ### DO NOT USE!
	 */
	$$prop_def: Props;
	/**
	 * @private
	 * For type checking capabilities only.
	 * Does not exist at runtime.
	 * ### DO NOT USE!
	 */
	$$events_def: Events;
	/**
	 * @private
	 * For type checking capabilities only.
	 * Does not exist at runtime.
	 * ### DO NOT USE!
	 */
	$$slot_def: Slots;

	constructor(options: IComponentOptions<Props>) {
		super(options);
	}
}

export function loop_guard(timeout) {
	const start = Date.now();
	return () => {
		if (Date.now() - start > timeout) {
			throw new Error('Infinite loop detected');
		}
	};
}
