/**
 * An object-based renderer for testing Svelte's custom renderer functionality.
 *
 * Runs in plain Node.js — no DOM required. Creates a tree of plain objects
 * with simple properties (type, name, children, attributes, value, etc).
 * Proves that Svelte can render into non-DOM targets.
 *
 * Renderers created with `cross: true` implement `embed` and `host`, so that they
 * can be combined with the DOM and with other custom renderers:
 *
 * - a component using this renderer inside the DOM is represented by a
 *   `<custom-root>` DOM element, whose `__custom` property holds the object tree
 * - a DOM component inside this renderer is represented by a `<dom-host>` object
 *   element, whose `dom` property holds a DOM container
 * - a component using another custom renderer is represented by a `<foreign-root>`
 *   element, whose `nested` property holds a fragment of the other renderer
 */

import { createRenderer } from '../../src/renderer/index.js';

export type ObjElement = {
	type: 'element';
	name: string;
	attributes: Record<string, string>;
	children: ObjNode[];
	listeners: Record<string, Array<{ handler: any; options?: any }>>;
	parent: ObjNode | null;
	/** DOM container for DOM content rendered inside this renderer */
	dom?: HTMLElement;
	/** container for content belonging to a different custom renderer */
	nested?: ObjFragment;
};
export type ObjText = { type: 'text'; value: string; parent: ObjNode | null };
export type ObjComment = { type: 'comment'; value: string; parent: ObjNode | null };
export type ObjFragment = { type: 'fragment'; children: ObjNode[]; parent: ObjNode | null };
export type ObjNode = ObjElement | ObjText | ObjComment | ObjFragment;

function insert_node(
	parent: ObjNode & { children?: ObjNode[] },
	node: ObjNode,
	anchor: ObjNode | null
) {
	if (node.type === 'fragment') {
		const children = [...(node.children ?? [])];
		for (const child of children) {
			insert_node(parent, child, anchor);
		}
		return;
	}

	// Remove from old parent first
	if (node.parent) {
		remove_from_parent(node);
	}

	const children: ObjNode[] = parent.children ?? [];
	node.parent = parent;

	if (anchor === null) {
		children.push(node);
	} else {
		const idx = children.indexOf(anchor);
		if (idx === -1) throw new Error('Anchor not found in parent');
		children.splice(idx, 0, node);
	}
}

function remove_from_parent(node: ObjNode) {
	const parent = node.parent;
	if (!parent || !('children' in parent)) return;

	const children = parent.children;
	const idx = children.indexOf(node);
	if (idx === -1) return;

	node.parent = null;

	children.splice(idx, 1);
}

function create_element(name: string): ObjElement {
	return { type: 'element', name, attributes: {}, children: [], listeners: {}, parent: null };
}

function create_fragment(): ObjFragment {
	return { type: 'fragment', children: [], parent: null };
}

/** Number of connections that have been created but not destroyed, for leak checks */
export const connections = { open: 0 };

export function create_test_renderer({ cross }: { cross: boolean }) {
	const renderer = createRenderer<{
		fragment: ObjFragment;
		element: ObjElement;
		text: ObjText;
		comment: ObjComment;
	}>({
		createFragment: create_fragment,
		createElement: create_element,

		createText(data) {
			return { type: 'text', value: data, parent: null };
		},

		createComment(data) {
			return { type: 'comment', value: data, parent: null };
		},

		getNodeType(node) {
			return node.type;
		},

		getText(node) {
			if (node.type === 'text' || node.type === 'comment') return node.value;
			return null;
		},

		getAttribute(element, name) {
			return element.attributes?.[name] ?? null;
		},

		setAttribute(element, key, value) {
			element.attributes[key] = String(value);
		},

		removeAttribute(element, name) {
			delete element.attributes[name];
		},

		setText(node, text) {
			node.value = text;
		},

		getFirstChild(element) {
			return element.children?.[0] ?? null;
		},

		getLastChild(element) {
			const c = element.children;
			return c?.[c.length - 1] ?? null;
		},

		getNextSibling(node) {
			const parent = node.parent;
			if (!parent || !('children' in parent)) return null;
			const idx = parent.children.indexOf(node);
			return parent.children[idx + 1] ?? null;
		},

		insert(parent, element, anchor) {
			insert_node(parent, element, anchor);
		},

		remove(node) {
			remove_from_parent(node);
		},

		getParent(node) {
			return node.parent ?? null;
		},

		addEventListener(target, type, handler, options) {
			if (target.type !== 'element') return;
			if (!target.listeners) target.listeners = {};
			if (!target.listeners[type]) target.listeners[type] = [];
			target.listeners[type].push({ handler, options });
		},

		removeEventListener(target, type, handler, options) {
			if (target.type !== 'element') return;
			if (!target.listeners?.[type]) return;
			target.listeners[type] = target.listeners[type].filter(
				(/** @type {any} */ l) => l.handler !== handler
			);
		}
	});

	if (cross) {
		// a component using this renderer, inside the DOM or another custom renderer
		renderer.embed = ({ host }) => {
			const container = create_fragment();
			connections.open += 1;

			if (host === null) {
				const node = document.createElement('custom-root');
				(node as any).__custom = container;

				return { node, container, destroy: () => void (connections.open -= 1) };
			}

			const node = host.createElement('foreign-root');
			node.nested = container;

			return { node, container, destroy: () => void (connections.open -= 1) };
		};

		// a component using a different renderer (that can't embed itself) inside this one
		renderer.host = ({ guest }) => {
			connections.open += 1;

			if (guest === null) {
				const node = create_element('dom-host');
				const container = document.createElement('dom-container');
				node.dom = container;

				return { node, container, destroy: () => void (connections.open -= 1) };
			}

			const node = create_element('foreign-root');
			const container = guest.createFragment();
			node.nested = container;

			return { node, container, destroy: () => void (connections.open -= 1) };
		};
	}

	return renderer;
}

const renderer = create_test_renderer({ cross: true });

// ---- Test helpers ----

/**
 * Create a root object for mounting components into.
 */
export function create_root() {
	return renderer.createFragment();
}

/**
 * Dispatch a synthetic event on an object node.
 */
export function dispatch_event(node: any, type: string, detail?: any) {
	const listeners = node.listeners?.[type];
	if (!listeners) return;
	const event = { type, detail, target: node };
	for (const { handler } of listeners) {
		handler(event);
	}
}

/**
 * Serialize an object tree to an HTML-like string for easy assertion.
 * Content belonging to other renderers (DOM or custom) is serialized inline.
 */
export function serialize(node: ObjNode): string {
	if (!node) return '';

	switch (node.type) {
		case 'text':
			return node.value ?? '';
		case 'comment':
			return '';
		case 'fragment':
			return node.children.map(serialize).join('');
		case 'element': {
			const tag = node.name;
			let attrs = '';
			const sorted_keys = Object.keys(node.attributes).sort();
			for (const key of sorted_keys) {
				attrs += ` ${key}="${node.attributes[key]}"`;
			}
			const children = node.dom
				? serialize_dom_children(node.dom)
				: node.nested
					? serialize(node.nested)
					: node.children.map(serialize).join('');
			return `<${tag}${attrs}>${children}</${tag}>`;
		}
		default:
			return '';
	}
}

/**
 * Serialize the children of a DOM node, including the object trees of any
 * custom renderer content embedded inside it.
 */
export function serialize_dom_children(node: Node): string {
	let result = '';

	for (const child of node.childNodes) {
		if (child.nodeType === 3) {
			result += child.textContent;
		} else if (child.nodeType === 1) {
			const element = child as Element;
			const tag = element.nodeName.toLowerCase();
			let attrs = '';
			for (const name of element.getAttributeNames().sort()) {
				attrs += ` ${name}="${element.getAttribute(name)}"`;
			}
			const custom = (element as any).__custom as ObjFragment | undefined;
			const children = custom ? serialize(custom) : serialize_dom_children(element);
			result += `<${tag}${attrs}>${children}</${tag}>`;
		}
	}

	return result;
}

export default renderer;
