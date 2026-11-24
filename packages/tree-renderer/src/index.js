/** @import { PlatformNodes, TreeRendererConfig, TreeRenderer, TreeNode, TreeChild, TreeParent, TreeElement, TreeText, TreeComment, TreeFragment } from './public.js' */
import { createRenderer } from 'svelte/renderer';

/**
 * Creates a custom renderer for platforms that can build a tree of their own objects, but
 * can't be asked about it. You create your platform's objects and apply mutations to them; the
 * tree renderer keeps track of the tree, and answers Svelte's questions about it.
 *
 * @template {PlatformNodes} [N=PlatformNodes]
 * @template [E=N['element']]
 * @template [T=N['text']]
 * @template [R=unknown extends N['root'] ? E : N['root']]
 * @param {TreeRendererConfig<{ element: E; text: T; root: R }>} config
 * @returns {TreeRenderer<{ element: E; text: T; root: R }>}
 */
export function createTreeRenderer(config) {
	/** @typedef {{ element: E; text: T; root: R }} P */

	/**
	 * Whether `node` reaches the platform. Svelte only uses comments as anchors
	 * @param {TreeChild<P>} node
	 * @returns {node is TreeElement<P> | TreeText<P>}
	 */
	function is_content(node) {
		return node.type !== 'comment';
	}

	/**
	 * The platform node whose children change when `parent`'s do: elements and roots have
	 * one, Svelte's template fragments don't
	 * @param {TreeParent<P>} parent
	 * @returns {E | R | undefined}
	 */
	function platform_parent(parent) {
		return parent.type === 'element' || parent.node !== undefined ? parent.node : undefined;
	}

	/**
	 * Position of `node` among the children of `parent` that reach the platform, and the
	 * platform node it comes before
	 * @param {TreeParent<P>} parent
	 * @param {TreeChild<P>} node
	 */
	function platform_position(parent, node) {
		const children = parent.children;
		let index = 0;
		let i = 0;

		for (; children[i] !== node; i++) {
			if (is_content(children[i])) index++;
		}

		/** @type {E | T | null} */
		let anchor = null;

		for (i++; i < children.length; i++) {
			const child = children[i];
			if (is_content(child)) {
				anchor = child.node;
				break;
			}
		}

		return { anchor, index };
	}

	/**
	 * `parent` is exposed as readonly but we own the nodes.
	 * @param {TreeChild<P>} node
	 * @param {TreeParent<P> | null} parent
	 */
	function set_parent(node, parent) {
		/** @type {{ parent: TreeParent<P> | null }} */ (node).parent = parent;
	}

	/** @param {TreeChild<P>} node */
	function remove(node) {
		const parent = node.parent;
		if (parent === null) return;

		const children = parent.children;
		const index = children.indexOf(node);
		if (index !== -1) children.splice(index, 1);
		set_parent(node, null);

		const platform = platform_parent(parent);
		if (platform !== undefined && is_content(node)) {
			config.remove(platform, node.node);
		}
	}

	/**
	 * @param {TreeParent<P>} parent
	 * @param {TreeNode<P>} node
	 * @param {TreeChild<P> | null} anchor
	 */
	function insert(parent, node, anchor) {
		if (node.type === 'fragment') {
			// fragments are flattened on insert: their children move into the
			// parent, the fragment stays empty
			for (const child of [...node.children]) {
				insert(parent, child, anchor);
			}
			return;
		}

		if (node.parent !== null) remove(node);

		const children = parent.children;
		let index = children.length;
		if (anchor !== null) {
			index = children.indexOf(anchor);
			if (index === -1) {
				throw new Error('createTreeRenderer: anchor is not a child of the given parent');
			}
		}

		children.splice(index, 0, node);
		set_parent(node, parent);

		const platform = platform_parent(parent);
		if (platform !== undefined && is_content(node)) {
			const position = platform_position(parent, node);
			config.insert(platform, node.node, position.anchor, position.index);
		}
	}

	/**
	 * @param {R | undefined} node
	 * @returns {TreeFragment<P>}
	 */
	function create_fragment(node) {
		return { type: 'fragment', node, children: [], parent: null };
	}

	/**
	 * @param {string} name
	 * @param {E} node
	 * @returns {TreeElement<P>}
	 */
	function create_element(name, node) {
		return { type: 'element', name, node, attributes: new Map(), children: [], parent: null };
	}

	/** @type {TreeRenderer<P>} */
	const renderer = {
		// the platform's root is what makes a fragment a root: changes to the children of a
		// fragment are only passed to the platform if it has a `node`
		createRoot: (root) => create_fragment(root),

		// what Svelte creates its templates with, so it never reaches the platform
		createFragment: () => create_fragment(undefined),

		createElement: (name) => create_element(name, config.createElement(name)),

		createText(data) {
			return { type: 'text', value: data, node: config.createText(data), parent: null };
		},

		createComment(data) {
			return { type: 'comment', value: data, node: undefined, parent: null };
		},

		getNodeType: (node) => node.type,

		getText: (node) => node.value,

		getAttribute: (element, name) => element.attributes.get(name) ?? null,

		setAttribute(element, key, value) {
			element.attributes.set(key, value);
			config.setAttribute(element.node, key, value);
		},

		removeAttribute(element, name) {
			if (element.attributes.delete(name)) {
				config.removeAttribute(element.node, name);
			}
		},

		hasAttribute: (element, name) => element.attributes.has(name),

		setText(node, text) {
			/** @type {{ value: string }} */ (node).value = text;
			config.setText(node.node, text);
		},

		getFirstChild: (node) => node.children[0] ?? null,

		getLastChild: (node) => node.children.at(-1) ?? null,

		getNextSibling(node) {
			const parent = node.parent;
			if (parent === null) return null;
			return parent.children[parent.children.indexOf(node) + 1] ?? null;
		},

		getParent: (node) => node.parent,

		insert,

		remove,

		addEventListener(element, type, handler, options) {
			config.addEventListener(element.node, type, handler, options);
		},

		removeEventListener(element, type, handler, options) {
			config.removeEventListener(element.node, type, handler, options);
		}
	};

	const { embed, host } = config;

	// only defined when provided: their presence is what allows Svelte to combine this
	// renderer with others
	if (embed) {
		renderer.embed = (context) => {
			const connection = embed(context);
			return { ...connection, container: create_fragment(connection.container) };
		};
	}

	if (host) {
		renderer.host = ({ guest, parent }) => {
			const connection = host({
				guest,
				parent: parent === null ? null : (platform_parent(parent) ?? null)
			});
			const node = connection.node === undefined ? undefined : create_element('', connection.node);
			return { ...connection, node };
		};
	}

	// on the server, this throws a helpful error
	createRenderer(renderer);

	return renderer;
}
