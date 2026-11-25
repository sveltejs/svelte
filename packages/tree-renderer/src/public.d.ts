import type { Renderer, RendererConnection } from 'svelte/renderer';

/** The types of your platform's objects */
export type PlatformNodes = {
	/** What `createElement` returns */
	element: unknown;
	/** What `createText` returns */
	text: unknown;
	/** What you pass to `createRoot` */
	root: unknown;
};

/**
 * A node in the tree that the tree renderer maintains. These are the nodes Svelte works with,
 * so they are what you get in attachments; `node` is your
 * platform's object.
 */
export type TreeNode<P extends PlatformNodes = PlatformNodes> =
	| TreeElement<P>
	| TreeText<P>
	| TreeComment<P>
	| TreeFragment<P>;

/** Nodes that can contain children. */
export type TreeParent<P extends PlatformNodes = PlatformNodes> = TreeElement<P> | TreeFragment<P>;

/** Nodes that can be a child of another node. */
export type TreeChild<P extends PlatformNodes = PlatformNodes> =
	| TreeElement<P>
	| TreeText<P>
	| TreeComment<P>;

export interface TreeElement<P extends PlatformNodes = PlatformNodes> {
	readonly type: 'element';
	/** The name passed to `createElement`, or `''` for nodes returned from `host` */
	readonly name: string;
	/** Your platform's element, as returned by `createElement` */
	readonly node: P['element'];
	/** Attribute values as Svelte set them — not coerced to strings. */
	readonly attributes: Map<string, any>;
	readonly children: TreeChild<P>[];
	readonly parent: TreeParent<P> | null;
}

export interface TreeText<P extends PlatformNodes = PlatformNodes> {
	readonly type: 'text';
	readonly value: string;
	/** Your platform's text node, as returned by `createText` */
	readonly node: P['text'];
	readonly parent: TreeParent<P> | null;
}

/** Svelte uses comments as anchors. They never reach your platform. */
export interface TreeComment<P extends PlatformNodes = PlatformNodes> {
	readonly type: 'comment';
	readonly value: string;
	readonly node: undefined;
	readonly parent: TreeParent<P> | null;
}

/**
 * Either a root created with `createRoot`, which is where your platform's tree starts, or one of
 * Svelte's internal template fragments, created with `createFragment`. Template fragments
 * never reach your platform: inserting one inserts its children.
 */
export interface TreeFragment<P extends PlatformNodes = PlatformNodes> {
	readonly type: 'fragment';
	/**
	 * Your platform's root, for roots created with `createRoot`. `undefined` for template
	 * fragments, which is how the tree renderer tells them apart: changes to the children of a
	 * fragment without a `node` are never passed to your platform.
	 */
	readonly node: P['root'] | undefined;
	readonly children: TreeChild<P>[];
	readonly parent: null;
}

/**
 * The platform-specific half of a renderer. The tree renderer implements everything else
 * (traversal, fragments, comments, …) and calls these with your own objects, after updating
 * its tree. Only elements, text nodes and roots reach your platform. `P` describes the types of
 * your platform's objects, for example:
 *
 * ```ts
 * const config: TreeRendererConfig<{ element: View; text: Label; root: Window }> = ...
 * ```
 */
export interface TreeRendererConfig<P extends PlatformNodes = PlatformNodes> {
	/** Create your platform's element. */
	createElement(name: string): P['element'];
	/** Create your platform's text node. */
	createText(text: string): P['text'];
	/**
	 * `node` is now a child of `parent`. `anchor` is the sibling it was inserted before, or
	 * `null` if it is the last child, and `index` is its position among `parent`'s children.
	 * A move arrives as `remove` followed by `insert`.
	 */
	insert(
		parent: P['element'] | P['root'],
		node: P['element'] | P['text'],
		anchor: P['element'] | P['text'] | null,
		index: number
	): void;
	/** `node` is no longer a child of `parent`. */
	remove(parent: P['element'] | P['root'], node: P['element'] | P['text']): void;
	/** Set the attribute with the given name and value on the element. */
	setAttribute(element: P['element'], key: string, value: any): void;
	/** Remove the attribute with the given name from the element. */
	removeAttribute(element: P['element'], key: string): void;
	/** Set the text of a text node. */
	setText(node: P['text'], text: string): void;
	/** Add an event listener of the given type and handler to the element. */
	addEventListener(element: P['element'], type: string, handler: any, options?: any): void;
	/** Remove an event listener of the given type and handler from the element. */
	removeEventListener(element: P['element'], type: string, handler: any, options?: any): void;
	/**
	 * Called when content using this renderer is rendered inside content belonging to a
	 * different renderer (`host` is `null` for the DOM). Return the root the content will be
	 * rendered into as `container` and, optionally, a `node` owned by the host that
	 * represents the content in the host tree. `parent` and `anchor` belong to the host.
	 *
	 * Without `embed` or `host`, combining this renderer with others throws.
	 */
	embed?(context: {
		host: Renderer<any> | null;
		parent: unknown;
		anchor: unknown;
	}): RendererConnection<unknown, P['root']>;
	/**
	 * Called when content using a different renderer (`guest` is `null` for the DOM), that
	 * doesn't define `embed`, is rendered inside this renderer. Return a `container` owned by
	 * the guest that the content will be rendered into and, optionally, an element of yours
	 * that represents the content in your tree, as `node`. `parent` is the element or root it
	 * will be inserted into, or `null` if it isn't known yet.
	 */
	host?(context: {
		guest: Renderer<any> | null;
		parent: P['element'] | P['root'] | null;
	}): RendererConnection<P['element'], unknown>;
}

export type TreeRenderer<P extends PlatformNodes = PlatformNodes> = Renderer<{
	fragment: TreeFragment<P>;
	element: TreeElement<P>;
	text: TreeText<P>;
	comment: TreeComment<P>;
}> & {
	/**
	 * Create a root for your platform's `root`, to use as the `target` of `mount`:
	 *
	 * ```js
	 * mount(App, { renderer, target: renderer.createRoot(screen) });
	 * ```
	 *
	 * Changes to its children are passed to your platform, with `root` as the parent.
	 */
	createRoot(root: P['root']): TreeFragment<P>;
	/**
	 * Create one of Svelte's internal template fragments. These never reach your platform, so
	 * don't use one as the `target` of `mount`, as you might with `createRenderer`: Svelte
	 * would render into it, but your platform wouldn't receive any of it. Use `createRoot`
	 * instead.
	 */
	createFragment(): TreeFragment<P>;
};

/**
 * Creates a custom renderer for platforms that can build a tree of their own objects, but
 * can't be asked about it. You create your platform's objects and apply mutations to them; the
 * tree renderer keeps track of the tree, and answers Svelte's questions about it.
 *
 * ```js
 * const renderer = createTreeRenderer({
 * 	createElement: (name) => new View(name),
 * 	createText: (text) => new Label(text),
 * 	insert: (parent, node, anchor, index) => parent.insertChild(node, index),
 * 	remove: (parent, node) => parent.removeChild(node),
 * 	setAttribute: (element, key, value) => element.setProp(key, value),
 * 	removeAttribute: (element, key) => element.clearProp(key),
 * 	setText: (node, text) => node.setText(text),
 * 	addEventListener: (element, type, handler) => element.on(type, handler),
 * 	removeEventListener: (element, type, handler) => element.off(type, handler)
 * });
 *
 * mount(App, { renderer, target: renderer.createRoot(platform_root) });
 * ```
 *
 * Mount into a root created with `createRoot`, not into `createFragment()`: fragments are
 * Svelte's internal template fragments, which never reach your platform.
 *
 * The types of your platform's objects are inferred from `createElement` and `createText`, as
 * long as those come first, and the root is assumed to be an element. Alternatively, pass them
 * as the type argument:
 *
 * ```ts
 * const renderer = createTreeRenderer<{ element: View; text: Label; root: Window }>({
 * 	// ...
 * });
 * ```
 *
 * Only the first type parameter is meant to be passed; the others exist so that the types can
 * be inferred from the methods (TypeScript can't infer the record itself from them).
 */
export function createTreeRenderer<
	N extends PlatformNodes = PlatformNodes,
	Element = N['element'],
	Text = N['text'],
	Root = unknown extends N['root'] ? Element : N['root']
>(
	config: TreeRendererConfig<{ element: Element; text: Text; root: Root }>
): TreeRenderer<{ element: Element; text: Text; root: Root }>;
