/**
 * A custom renderer. `N` describes the types of the renderer's nodes, for example:
 *
 * ```ts
 * const renderer: Renderer<{ fragment: MyFragment; element: MyElement; text: MyText; comment: MyComment }> = ...
 * ```
 */
export type Renderer<N extends RendererNodes = RendererNodes> = {
	/** Creates a fragment, a container for multiple nodes. Inserting a fragment should insert all of its children. */
	createFragment(): N['fragment'];

	/** Creates an element with the given name. */
	createElement(name: string): N['element'];

	/** Creates a text node with the given data. */
	createTextNode(data: string): N['text'];

	/**
	 * Creates a comment node with the given data.
	 * This is often used as an anchor for inserting elements; it doesn't necessarily need to be rendered.
	 */
	createComment(data: string): N['comment'];

	/** Should return the type of the node in string form. */
	nodeType(node: N[NodeType]): NodeType;

	/**
	 * Return the value of the node:
	 * - text value of a text node
	 * - data value of a comment
	 * - null for elements and fragments
	 */
	getNodeValue(node: N['text'] | N['comment']): string | null;

	/** Return the value of the attribute with the given name on the element, or null if it doesn't exist. */
	getAttribute(element: N['element'], name: string): string | null;

	/** Set the attribute with the given name and value on the element. */
	setAttribute(element: N['element'], key: string, value: any): void;

	/** Remove the attribute with the given name from the element. */
	removeAttribute(element: N['element'], name: string): void;

	/** Return true if the element has an attribute with the given name. */
	hasAttribute(element: N['element'], name: string): boolean;

	/**
	 * Set the text content of the node to the given value.
	 * This should work for both text nodes and elements.
	 */
	setText(node: N['element'] | N['text'] | N['comment'], text: string): void;

	/** Return the first child of the element or fragment, or null if it has no children. */
	getFirstChild(element: N['element'] | N['fragment']): N[NodeType] | null;

	/** Return the last child of the element or fragment, or null if it has no children. */
	getLastChild(element: N['element'] | N['fragment']): N[NodeType] | null;

	/** Return the next sibling of the node, or null if it has no next sibling. */
	getNextSibling(node: N['element'] | N['text'] | N['comment']): N[NodeType] | null;

	/**
	 * Insert the element into the parent before the anchor.
	 * If anchor is null, insert at the end.
	 */
	insert(
		parent: N['element'] | N['fragment'],
		element: N[NodeType],
		anchor: N['element'] | N['text'] | N['comment'] | null
	): void;

	/** Remove the node from the tree. */
	remove(node: N['element'] | N['text'] | N['comment']): void;

	/** Return the parent of the element, or null if it has no parent. */
	getParent(element: N['element'] | N['text'] | N['comment']): N[NodeType] | null;

	/** Add an event listener of the given type and handler to the target node. */
	addEventListener(target: N['element'], type: string, handler: any, options?: any): void;

	/** Remove an event listener of the given type and handler from the target node. */
	removeEventListener(target: N['element'], type: string, handler: any, options?: any): void;

	/**
	 * Called when a component (or snippet) that uses this renderer is rendered inside
	 * content that belongs to a different renderer (`host` is `null` for the DOM).
	 *
	 * Return a `container` owned by this renderer that the content will be rendered into
	 * and, optionally, a `node` owned by the host that represents the content in the host
	 * tree. If no `node` is returned, an empty text node is used.
	 *
	 * `parent` is the host-owned parent of the position being rendered into, which makes it
	 * possible to render into an element the user wrote, for example a `<canvas>`.
	 */
	embed?(context: {
		host: Renderer<any> | null;
		parent: unknown;
		anchor: unknown;
	}): RendererConnection<unknown, N['element'] | N['fragment']>;

	/**
	 * Called when a component (or snippet) that uses a different renderer (`guest` is `null`
	 * for the DOM) is rendered inside content that belongs to this renderer, and the guest
	 * renderer doesn't define `embed`.
	 *
	 * Return a `container` owned by the guest renderer that the content will be rendered into
	 * and, optionally, a `node` owned by this renderer that represents the content in this tree.
	 */
	host?(context: {
		guest: Renderer<any> | null;
		parent: N['element'] | N['fragment'] | null;
		anchor: N['element'] | N['text'] | N['comment'];
	}): RendererConnection<N['element'] | N['text'] | N['comment'], unknown>;
};

/**
 * Describes how content belonging to one renderer is attached to content belonging to another
 */
export type RendererConnection<THostNode, TContainer> = {
	/** A node owned by the host renderer that represents the content in the host tree */
	node?: THostNode;
	/** A node owned by the guest renderer that the content is rendered into */
	container: TContainer;
	/** Called after the content has been removed */
	destroy?(): void;
};

/**
 * The types of a custom renderer's nodes. Used as the type argument of `Renderer` and `createRenderer`
 */
export type RendererNodes = {
	fragment: object;
	element: object;
	text: object;
	comment: object;
};

export type NodeType = keyof RendererNodes;
