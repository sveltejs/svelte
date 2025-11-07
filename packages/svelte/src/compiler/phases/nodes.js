/** @import { Expression, PrivateIdentifier } from 'estree' */
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
 * @param {number} start
 * @param {number} end
 * @param {AST.Attribute['value']} value
 * @returns {AST.Attribute}
 */
export function create_attribute(name, start, end, value) {
	return {
		type: 'Attribute',
		start,
		end,
		name,
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
