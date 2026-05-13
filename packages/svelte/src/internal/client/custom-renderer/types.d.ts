type NodeType = 'fragment' | 'element' | 'text' | 'comment';

export type RendererNodes<
	Fragment extends object = object,
	Element extends object = object,
	TextNode extends object = object,
	Comment extends object = object
> = { fragment: Fragment; element: Element; text: TextNode; comment: Comment };

type AnyNode<T extends RendererNodes> = T[NodeType];

export type Renderer<T extends RendererNodes = RendererNodes> = {
	/** Creates a fragment, a container for multiple nodes. Inserting a fragment should insert all of its children. */
	createFragment(): T['fragment'];

	/** Creates an element with the given name. */
	createElement(name: string): T['element'];

	/** Creates a text node with the given data. */
	createTextNode(data: string): T['text'];

	/**
	 * Creates a comment node with the given data.
	 * This is often used as an anchor for inserting elements; it doesn't necessarily need to be rendered.
	 */
	createComment(data: string): T['comment'];

	/** Should return the type of the node in string form. */
	nodeType(node: AnyNode<T>): NodeType;

	/**
	 * Return the value of the node:
	 * - text value of a text node
	 * - data value of a comment
	 * - null for elements and fragments
	 */
	getNodeValue(node: T['text'] | T['comment']): string | null;

	/** Return the value of the attribute with the given name on the element, or null if it doesn't exist. */
	getAttribute(element: T['element'], name: string): string | null;

	/** Set the attribute with the given name and value on the element. */
	setAttribute(element: T['element'], key: string, value: any): void;

	/** Remove the attribute with the given name from the element. */
	removeAttribute(element: T['element'], name: string): void;

	/** Return true if the element has an attribute with the given name. */
	hasAttribute(element: T['element'], name: string): boolean;

	/**
	 * Set the text content of the node to the given value.
	 * This should work for both text nodes and elements.
	 */
	setText(node: T['element'] | T['text'] | T['comment'], text: string): void;

	/** Return the first child of the element or fragment, or null if it has no children. */
	getFirstChild(element: T['element'] | T['fragment']): AnyNode<T> | null;

	/** Return the last child of the element or fragment, or null if it has no children. */
	getLastChild(element: T['element'] | T['fragment']): AnyNode<T> | null;

	/** Return the next sibling of the node, or null if it has no next sibling. */
	getNextSibling(node: T['element'] | T['text'] | T['comment']): AnyNode<T> | null;

	/**
	 * Insert the element into the parent before the anchor.
	 * If anchor is null, insert at the end.
	 */
	insert(
		parent: T['element'] | T['fragment'],
		element: AnyNode<T>,
		anchor: T['element'] | T['text'] | T['comment'] | null
	): void;

	/** Remove the node from the tree. */
	remove(node: T['element'] | T['text'] | T['comment']): void;

	/** Return the parent of the element, or null if it has no parent. */
	getParent(element: T['element'] | T['text'] | T['comment']): AnyNode<T> | null;

	/** Add an event listener of the given type and handler to the target node. */
	addEventListener(target: T['element'], type: string, handler: any, options?: any): void;

	/** Remove an event listener of the given type and handler from the target node. */
	removeEventListener(target: T['element'], type: string, handler: any, options?: any): void;
};
