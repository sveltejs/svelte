/**
 * A fake platform for the tests: a tree of plain objects that can only be built, through the
 * calls the tree renderer makes. Every call is recorded in `calls`, and the calls check
 * themselves: `anchor` and `index` must agree, a node can't be inserted while it has a parent,
 * and only nodes that are there can be removed.
 */

import type { TreeNode, TreeRendererConfig } from '../src/public.js';

export interface PElement {
	kind: 'element';
	name: string;
	props: Record<string, unknown>;
	children: PNode[];
	listeners: Record<string, Array<{ handler: (...args: any[]) => unknown; options?: unknown }>>;
	parent: PParent | null;
	/** The DOM container of DOM content rendered inside the platform */
	dom?: HTMLElement;
}

export interface PText {
	kind: 'text';
	text: string;
	parent: PParent | null;
}

export interface PRoot {
	kind: 'root';
	name: string;
	children: PNode[];
}

export type PNode = PElement | PText;
export type PParent = PElement | PRoot;
export type Platform = { element: PElement; text: PText; root: PRoot };

export function create_element(name: string): PElement {
	return { kind: 'element', name, props: {}, children: [], listeners: {}, parent: null };
}

export function create_root(name = 'root'): PRoot {
	return { kind: 'root', name, children: [] };
}

export function label(node: PNode | PParent | null): string {
	if (node === null) return 'end';
	if (node.kind === 'text') return JSON.stringify(node.text);
	if (node.kind === 'root') return node.name;
	return `<${node.name}>`;
}

/** The platform half of a tree renderer, recording every call in `calls` */
export function create_platform(calls: string[] = []): TreeRendererConfig<Platform> {
	return {
		createElement: create_element,

		createText: (text) => ({ kind: 'text', text, parent: null }),

		insert(parent, node, anchor, index) {
			calls.push(`insert ${label(node)} into ${label(parent)} at ${index} before ${label(anchor)}`);
			if (node.parent !== null) throw new Error('insert: the node already has a parent');
			if ((parent.children[index] ?? null) !== anchor) {
				throw new Error('insert: anchor and index disagree');
			}
			parent.children.splice(index, 0, node);
			node.parent = parent;
		},

		remove(parent, node) {
			calls.push(`remove ${label(node)} from ${label(parent)}`);
			const index = parent.children.indexOf(node);
			if (index === -1) throw new Error('remove: the node is not a child of the parent');
			parent.children.splice(index, 1);
			node.parent = null;
		},

		setAttribute(element, key, value) {
			calls.push(`set ${label(element)} ${key}`);
			element.props[key] = value;
		},

		removeAttribute(element, key) {
			calls.push(`unset ${label(element)} ${key}`);
			delete element.props[key];
		},

		setText(node, text) {
			calls.push(`text ${label(node)} -> ${JSON.stringify(text)}`);
			node.text = text;
		},

		addEventListener(element, type, handler, options) {
			calls.push(`listen ${label(element)} ${type}`);
			(element.listeners[type] ??= []).push({ handler, options });
		},

		removeEventListener(element, type, handler) {
			calls.push(`unlisten ${label(element)} ${type}`);
			element.listeners[type] = element.listeners[type]?.filter((l) => l.handler !== handler);
		}
	};
}

/** Calls the handlers the platform received for `type`, like a platform's event system would */
export function fire(element: PElement, type: string, ...args: unknown[]) {
	for (const { handler } of element.listeners[type] ?? []) handler(...args);
}

/** An HTML-like string of the platform's tree */
export function serialize(node: PNode | PParent): string {
	if (node.kind === 'text') return node.text;

	const children = node.children.map(serialize).join('');
	if (node.kind === 'root') return children;

	let props = '';
	for (const key of Object.keys(node.props).sort()) {
		props += ` ${key}="${String(node.props[key])}"`;
	}
	return `<${node.name}${props}>${children}</${node.name}>`;
}

/** The HTML of a DOM element, without the comments Svelte uses as anchors */
export function dom_html(element: Element) {
	return element.innerHTML.replace(/<!--[^]*?-->/g, '');
}

/**
 * Throws unless the platform's tree below `node` mirrors the tree renderer's: the same
 * elements and text nodes, in the same order, without comments
 */
export function assert_mirror(node: TreeNode<Platform>) {
	if (node.type === 'comment') return;

	if (node.type === 'text') {
		if (node.node.text !== node.value) throw new Error(`text out of sync: ${label(node.node)}`);
		return;
	}

	if (node.node !== undefined) {
		const expected = node.children.flatMap((child) =>
			child.type === 'comment' ? [] : [child.node]
		);
		const actual = node.node.children;
		if (expected.length !== actual.length || expected.some((child, i) => child !== actual[i])) {
			throw new Error(`children out of sync: ${label(node.node)}`);
		}
	}

	for (const child of node.children) assert_mirror(child);
}
