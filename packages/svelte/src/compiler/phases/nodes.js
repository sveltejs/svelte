/** @import { Ast, ExpressionMetadata } from '#compiler' */
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
 * @param {Ast.SvelteNode} node
 * @returns {node is Ast.Component | Ast.RegularElement | Ast.SlotElement | Ast.SvelteComponent | Ast.SvelteElement | Ast.SvelteFragment | Ast.SvelteSelf}
 */
export function is_element_node(node) {
	return element_nodes.includes(node.type);
}

/**
 * @param {Ast.RegularElement | Ast.SvelteElement} node
 * @returns {boolean}
 */
export function is_custom_element_node(node) {
	return node.type === 'RegularElement' && node.name.includes('-');
}

/**
 * @param {string} name
 * @param {number} start
 * @param {number} end
 * @param {Ast.Attribute['value']} value
 * @returns {Ast.Attribute}
 */
export function create_attribute(name, start, end, value) {
	return {
		type: 'Attribute',
		start,
		end,
		name,
		value,
		parent: null,
		metadata: {
			expression: create_expression_metadata(),
			delegated: null
		}
	};
}

/**
 * @returns {ExpressionMetadata}
 */
export function create_expression_metadata() {
	return {
		dependencies: new Set(),
		has_state: false,
		has_call: false
	};
}
