/**
 * An object-based renderer for testing Svelte's custom renderer functionality.
 *
 * Runs in plain Node.js — no DOM required. Creates a tree of plain objects
 * with simple properties (type, name, children, attributes, value, etc).
 * Proves that Svelte can render into non-DOM targets.
 */

import { createRenderer } from '../../src/renderer/index.js';

/**
 * @typedef {{ type: 'element', name: string, attributes: Record<string, string>, children: ObjNode[], listeners: Record<string, Array<{handler: any, options?: any}>>, parent: ObjNode | null, next_sibling: ObjNode | null, prev_sibling: ObjNode | null }} ObjElement
 * @typedef {{ type: 'text', value: string, parent: ObjNode | null, next_sibling: ObjNode | null, prev_sibling: ObjNode | null }} ObjText
 * @typedef {{ type: 'comment', value: string, parent: ObjNode | null, next_sibling: ObjNode | null, prev_sibling: ObjNode | null }} ObjComment
 * @typedef {{ type: 'fragment', children: ObjNode[], parent: ObjNode | null, next_sibling: ObjNode | null, prev_sibling: ObjNode | null }} ObjFragment
 * @typedef {ObjElement | ObjText | ObjComment | ObjFragment} ObjNode
 */

/**
 * @param {ObjNode & { children?: ObjNode[] }} parent
 * @param {ObjNode} node
 * @param {ObjNode | null} anchor
 */
function insert_node(parent, node, anchor) {
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

	const children = /** @type {ObjNode[]} */ (parent.children);
	node.parent = parent;

	if (anchor === null) {
		const last = children[children.length - 1] ?? null;
		if (last) {
			last.next_sibling = node;
			node.prev_sibling = last;
		}
		node.next_sibling = null;
		children.push(node);
	} else {
		const idx = children.indexOf(anchor);
		if (idx === -1) throw new Error('Anchor not found in parent');

		const prev = children[idx - 1] ?? null;
		if (prev) {
			prev.next_sibling = node;
			node.prev_sibling = prev;
		}
		node.next_sibling = anchor;
		anchor.prev_sibling = node;
		children.splice(idx, 0, node);
	}
}

/** @param {ObjNode} node */
function remove_from_parent(node) {
	const parent = node.parent;
	if (!parent || !('children' in parent)) return;

	const children = parent.children;
	const idx = children.indexOf(node);
	if (idx === -1) return;

	const prev = children[idx - 1] ?? null;
	const next = children[idx + 1] ?? null;
	if (prev) prev.next_sibling = next;
	if (next) next.prev_sibling = prev;

	node.prev_sibling = null;
	node.next_sibling = null;
	node.parent = null;

	children.splice(idx, 1);
}

const renderer = createRenderer({
	createFragment() {
		return /** @type {ObjFragment} */ ({
			type: 'fragment',
			children: [],
			parent: null,
			next_sibling: null,
			prev_sibling: null
		});
	},

	createElement(name) {
		return /** @type {ObjElement} */ ({
			type: 'element',
			name,
			attributes: {},
			children: [],
			listeners: {},
			parent: null,
			next_sibling: null,
			prev_sibling: null
		});
	},

	createTextNode(data) {
		return /** @type {ObjText} */ ({
			type: 'text',
			value: data,
			parent: null,
			next_sibling: null,
			prev_sibling: null
		});
	},

	createComment(data) {
		return /** @type {ObjComment} */ ({
			type: 'comment',
			value: data,
			parent: null,
			next_sibling: null,
			prev_sibling: null
		});
	},

	nodeType(node) {
		return node.type;
	},

	getNodeValue(node) {
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

	hasAttribute(element, name) {
		return name in (element.attributes ?? {});
	},

	setText(node, text) {
		if (node.type === 'text' || node.type === 'comment') {
			node.value = text;
		}
	},

	getFirstChild(element) {
		return element.children?.[0] ?? null;
	},

	getLastChild(element) {
		const c = element.children;
		return c?.[c.length - 1] ?? null;
	},

	getNextSibling(node) {
		return node.next_sibling ?? null;
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

// ---- Test helpers ----

/**
 * Create a root object for mounting components into.
 * @returns {ObjElement}
 */
export function create_root() {
	return renderer.createElement('root');
}

/**
 * Dispatch a synthetic event on an object node.
 * @param {any} node
 * @param {string} type
 * @param {any} [detail]
 */
export function dispatch_event(node, type, detail) {
	const listeners = node.listeners?.[type];
	if (!listeners) return;
	const event = { type, detail, target: node };
	for (const { handler } of listeners) {
		handler(event);
	}
}

/**
 * Serialize an object tree to an HTML-like string for easy assertion.
 * @param {ObjNode} node
 * @returns {string}
 */
export function serialize(node) {
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
			const children = node.children.map(serialize).join('');
			return `<${tag}${attrs}>${children}</${tag}>`;
		}
		default:
			return '';
	}
}

export default renderer;
