/** @import * as Compiler from '#compiler' */
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
 * @param {Compiler.SvelteNode} node
 * @returns {node is Compiler.Component | Compiler.RegularElement | Compiler.SlotElement | Compiler.SvelteComponent | Compiler.SvelteElement | Compiler.SvelteFragment | Compiler.SvelteSelf}
 */
export function is_element_node(node) {
	return element_nodes.includes(node.type);
}

/**
 * @param {Compiler.RegularElement | Compiler.SvelteElement} node
 * @returns {boolean}
 */
export function is_custom_element_node(node) {
	return node.type === 'RegularElement' && node.name.includes('-');
}

/**
 * @param {string} name
 * @param {number} start
 * @param {number} end
 * @param {true | Array<Compiler.Text | Compiler.ExpressionTag>} value
 * @returns {Compiler.Attribute}
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
			dynamic: false,
			delegated: null
		}
	};
}
