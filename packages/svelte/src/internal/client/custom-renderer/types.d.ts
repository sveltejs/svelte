export type NodeType = 'fragment' | 'element' | 'text' | 'comment';

export type Renderer<
	TFragment extends object = object,
	TElement extends object = object,
	TTextNode extends object = object,
	TComment extends object = object,
	TNode extends TFragment | TElement | TTextNode | TComment =
		| TFragment
		| TElement
		| TTextNode
		| TComment
> = {
	/** Creates a fragment, a container for multiple nodes. Inserting a fragment should insert all of its children. */
	createFragment(): TFragment;

	/** Creates an element with the given name. */
	createElement(name: string): TElement;

	/** Creates a text node with the given data. */
	createTextNode(data: string): TTextNode;

	/**
	 * Creates a comment node with the given data.
	 * This is often used as an anchor for inserting elements; it doesn't necessarily need to be rendered.
	 */
	createComment(data: string): TComment;

	/** Should return the type of the node in string form. */
	nodeType(node: TNode): NodeType;

	/**
	 * Return the value of the node:
	 * - text value of a text node
	 * - data value of a comment
	 * - null for elements and fragments
	 */
	getNodeValue(node: TTextNode | TComment): string | null;

	/** Return the value of the attribute with the given name on the element, or null if it doesn't exist. */
	getAttribute(element: TElement, name: string): string | null;

	/** Set the attribute with the given name and value on the element. */
	setAttribute(element: TElement, key: string, value: any): void;

	/** Remove the attribute with the given name from the element. */
	removeAttribute(element: TElement, name: string): void;

	/** Return true if the element has an attribute with the given name. */
	hasAttribute(element: TElement, name: string): boolean;

	/**
	 * Set the text content of the node to the given value.
	 * This should work for both text nodes and elements.
	 */
	setText(node: TElement | TTextNode | TComment, text: string): void;

	/** Return the first child of the element or fragment, or null if it has no children. */
	getFirstChild(element: TElement | TFragment): TNode | null;

	/** Return the last child of the element or fragment, or null if it has no children. */
	getLastChild(element: TElement | TFragment): TNode | null;

	/** Return the next sibling of the node, or null if it has no next sibling. */
	getNextSibling(node: TElement | TTextNode | TComment): TNode | null;

	/**
	 * Insert the element into the parent before the anchor.
	 * If anchor is null, insert at the end.
	 */
	insert(
		parent: TElement | TFragment,
		element: TNode,
		anchor: TElement | TTextNode | TComment | null
	): void;

	/** Remove the node from the tree. */
	remove(node: TElement | TTextNode | TComment): void;

	/** Return the parent of the element, or null if it has no parent. */
	getParent(element: TElement | TTextNode | TComment): TNode | null;

	/** Add an event listener of the given type and handler to the target node. */
	addEventListener(target: TElement, type: string, handler: any, options?: any): void;

	/** Remove an event listener of the given type and handler from the target node. */
	removeEventListener(target: TElement, type: string, handler: any, options?: any): void;
};
