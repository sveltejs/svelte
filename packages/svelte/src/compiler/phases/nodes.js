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
 * Checks if an <option>, <optgroup>, or <select> element has rich content that requires special hydration handling.
 * Rich content is anything beyond simple text, expressions, and comments for <option>,
 * anything beyond <option> children for <optgroup>,
 * or anything beyond <option>, <optgroup>, and empty text for <select>.
 * Control flow blocks are recursively checked - they only count as rich content if they contain rich content.
 * @param {AST.RegularElement} node
 * @returns {boolean}
 */
export function is_customizable_select_element(node) {
	if (node.name === 'select' || node.name === 'optgroup' || node.name === 'option') {
		for (const child of find_descendants(node.fragment)) {
			if (child.type === 'RegularElement') {
				if (node.name === 'select' && child.name !== 'option' && child.name !== 'optgroup') {
					return true;
				}

				if (node.name === 'optgroup' && child.name !== 'option') {
					return true;
				}

				if (node.name === 'option') {
					return true;
				}
			}

			// Text nodes directly in <select> or <optgroup> are rich content
			else if (child.type === 'Text') {
				if (node.name === 'select' || node.name === 'optgroup') {
					return true;
				}
			}

			// Any non-RegularElement, non-Text node is rich content
			else {
				return true;
			}
		}
	}

	return false;
}

/**
 * @param {AST.Fragment | null} fragment
 * @returns {Iterable<AST.SvelteNode>}
 */
function* find_descendants(fragment) {
	if (fragment === null) return;

	for (const node of fragment.nodes) {
		switch (node.type) {
			case 'SnippetBlock':
			case 'DebugTag':
			case 'ConstTag':
			case 'Comment':
			case 'ExpressionTag':
				break;

			case 'Text':
				if (node.data.trim() !== '') {
					yield node;
				}
				break;

			case 'IfBlock':
				yield* find_descendants(node.consequent);
				yield* find_descendants(node.alternate);
				break;

			case 'EachBlock':
				yield* find_descendants(node.body);
				yield* find_descendants(node.fallback ?? null);
				break;

			case 'KeyBlock':
				yield* find_descendants(node.fragment);
				break;

			case 'AwaitBlock':
				yield* find_descendants(node.pending);
				yield* find_descendants(node.then);
				yield* find_descendants(node.catch);
				break;

			case 'SvelteBoundary':
				yield* find_descendants(node.fragment);
				break;

			default:
				yield node;
		}
	}
}
