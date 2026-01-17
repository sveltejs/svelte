/** @import { Expression, PrivateIdentifier, SourceLocation } from 'estree' */
/** @import { AST, Binding } from '#compiler' */
import * as b from '#compiler/builders';

/**
 * All nodes that can appear elsewhere than the top level, have attributes and can contain children
 */
const element_nodes = [
	'SvelteElement',
	'RegularElement',
	'SvelteFragment',
	'Component',
	'SvelteComponent',
	'SvelteSelf',
	'SlotElement'
];

/**
 * Returns true for all nodes that can appear elsewhere than the top level, have attributes and can contain children
 * @param {AST.SvelteNode} node
 * @returns {node is AST.Component | AST.RegularElement | AST.SlotElement | AST.SvelteComponent | AST.SvelteElement | AST.SvelteFragment | AST.SvelteSelf}
 */
export function is_element_node(node) {
	return element_nodes.includes(node.type);
}

/**
 * Returns true for all component-like nodes
 * @param {AST.SvelteNode} node
 * @returns {node is AST.Component |  AST.SvelteComponent | AST.SvelteSelf}
 */
export function is_component_node(node) {
	return ['Component', 'SvelteComponent', 'SvelteSelf'].includes(node.type);
}

/**
 * @param {AST.RegularElement | AST.SvelteElement} node
 * @returns {boolean}
 */
export function is_custom_element_node(node) {
	return (
		node.type === 'RegularElement' &&
		(node.name.includes('-') ||
			node.attributes.some((attr) => attr.type === 'Attribute' && attr.name === 'is'))
	);
}

/**
 * @param {string} name
 * @param {SourceLocation | null} name_loc
 * @param {number} start
 * @param {number} end
 * @param {AST.Attribute['value']} value
 * @returns {AST.Attribute}
 */
export function create_attribute(name, name_loc, start, end, value) {
	return {
		type: 'Attribute',
		start,
		end,
		name,
		name_loc,
		value,
		metadata: {
			delegated: false,
			needs_clsx: false
		}
	};
}
export class ExpressionMetadata {
	/** True if the expression references state directly, or _might_ (via member/call expressions) */
	has_state = false;

	/** True if the expression involves a call expression (often, it will need to be wrapped in a derived) */
	has_call = false;

	/** True if the expression contains `await` */
	has_await = false;

	/** True if the expression includes a member expression */
	has_member_expression = false;

	/** True if the expression includes an assignment or an update */
	has_assignment = false;

	/**
	 * All the bindings that are referenced eagerly (not inside functions) in this expression
	 * @type {Set<Binding>}
	 */
	dependencies = new Set();

	/**
	 * True if the expression references state directly, or _might_ (via member/call expressions)
	 * @type {Set<Binding>}
	 */
	references = new Set();

	/** @type {null | Set<Expression>} */
	#blockers = null;

	#get_blockers() {
		if (!this.#blockers) {
			this.#blockers = new Set();

			for (const d of this.dependencies) {
				if (d.blocker) this.#blockers.add(d.blocker);
			}
		}

		return this.#blockers;
	}

	blockers() {
		return b.array([...this.#get_blockers()]);
	}

	has_blockers() {
		return this.#get_blockers().size > 0;
	}

	is_async() {
		return this.has_await || this.#get_blockers().size > 0;
	}

	/**
	 * @param {ExpressionMetadata} source
	 */
	merge(source) {
		this.has_state ||= source.has_state;
		this.has_call ||= source.has_call;
		this.has_await ||= source.has_await;
		this.has_member_expression ||= source.has_member_expression;
		this.has_assignment ||= source.has_assignment;
		this.#blockers = null; // so that blockers are recalculated

		for (const r of source.references) this.references.add(r);
		for (const b of source.dependencies) this.dependencies.add(b);
	}
}

/**
 * @param {Expression | PrivateIdentifier} node
 */
export function get_name(node) {
	if (node.type === 'Literal') return String(node.value);
	if (node.type === 'PrivateIdentifier') return '#' + node.name;
	if (node.type === 'Identifier') return node.name;

	return null;
}

/**
 * Gets all fragment children from a block or boundary node that should be recursively checked
 * @param {AST.EachBlock | AST.IfBlock | AST.AwaitBlock | AST.KeyBlock | AST.SvelteBoundary} node
 * @returns {AST.SvelteNode[]}
 */
function get_recursive_fragments(node) {
	switch (node.type) {
		case 'EachBlock':
			return [...node.body.nodes, ...(node.fallback?.nodes ?? [])];
		case 'IfBlock':
			return [...node.consequent.nodes, ...(node.alternate?.nodes ?? [])];
		case 'AwaitBlock':
			return [
				...(node.pending?.nodes ?? []),
				...(node.then?.nodes ?? []),
				...(node.catch?.nodes ?? [])
			];
		case 'KeyBlock':
			return node.fragment.nodes;
		case 'SvelteBoundary':
			return node.fragment.nodes;
	}
}

/**
 * Checks if a child should be recursively explored for rich content
 * @param {AST.SvelteNode} child
 * @returns {child is AST.EachBlock | AST.IfBlock | AST.AwaitBlock | AST.KeyBlock | AST.SvelteBoundary}
 */
function should_recurse(child) {
	return (
		child.type === 'EachBlock' ||
		child.type === 'IfBlock' ||
		child.type === 'AwaitBlock' ||
		child.type === 'KeyBlock' ||
		child.type === 'SvelteBoundary'
	);
}

/**
 * Checks if a child is a non-content node that should be ignored for rich content detection
 * (snippet definitions, const declarations, etc.)
 * @param {AST.SvelteNode} child
 * @returns {boolean}
 */
function is_ignored_node(child) {
	return child.type === 'SnippetBlock' || child.type === 'ConstTag' || child.type === 'DebugTag';
}

/**
 * Checks if a child is rich content for an <option> element
 * @param {AST.SvelteNode} child
 * @returns {boolean}
 */
function is_option_rich_content(child) {
	if (child.type === 'Text' || child.type === 'ExpressionTag' || child.type === 'Comment') {
		return false;
	}
	if (is_ignored_node(child)) {
		return false;
	}
	if (should_recurse(child)) {
		return get_recursive_fragments(child).some(is_option_rich_content);
	}
	return true;
}

/**
 * Checks if a child is rich content for an <optgroup> element
 * @param {AST.SvelteNode} child
 * @returns {boolean}
 */
function is_optgroup_rich_content(child) {
	// For optgroup, only <option> elements, comments, and empty/whitespace text nodes are "normal" content.
	if (child.type === 'Comment') {
		return false;
	}
	if (child.type === 'RegularElement' && child.name === 'option') {
		return false;
	}
	if (child.type === 'Text' && child.data.trim() === '') {
		return false;
	}
	if (is_ignored_node(child)) {
		return false;
	}
	if (should_recurse(child)) {
		return get_recursive_fragments(child).some(is_optgroup_rich_content);
	}
	return true;
}

/**
 * Checks if a child is rich content for a <select> element
 * @param {AST.SvelteNode} child
 * @returns {boolean}
 */
function is_select_rich_content(child) {
	// For select, only <option>, <optgroup> elements, comments, and empty/whitespace text nodes are "normal" content.
	if (child.type === 'Comment') {
		return false;
	}
	if (child.type === 'RegularElement' && (child.name === 'option' || child.name === 'optgroup')) {
		return false;
	}
	if (child.type === 'Text' && child.data.trim() === '') {
		return false;
	}
	if (is_ignored_node(child)) {
		return false;
	}
	if (should_recurse(child)) {
		return get_recursive_fragments(child).some(is_select_rich_content);
	}
	return true;
}

/**
 * Checks if an <option>, <optgroup>, or <select> element has rich content that requires special hydration handling.
 * Rich content is anything beyond simple text, expressions, and comments for <option>,
 * anything beyond <option> children for <optgroup>,
 * or anything beyond <option>, <optgroup>, and empty text for <select>.
 * Control flow blocks are recursively checked - they only count as rich content if they contain rich content.
 * @param {AST.RegularElement} node
 * @param {AST.SvelteNode[]} children - The trimmed/filtered children of the element
 * @returns {boolean}
 */
export function is_customizable_select_element_with_rich_content(node, children) {
	if (node.name === 'option') {
		return children.some(is_option_rich_content);
	}

	if (node.name === 'optgroup') {
		return children.some(is_optgroup_rich_content);
	}

	if (node.name === 'select') {
		return children.some(is_select_rich_content);
	}

	return false;
}
