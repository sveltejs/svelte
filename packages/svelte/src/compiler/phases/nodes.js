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
 * @param {import('#compiler').SvelteNode} node
 * @returns {node is import('#compiler').Component | import('#compiler').RegularElement | import('#compiler').SlotElement | import('#compiler').SvelteComponent | import('#compiler').SvelteElement | import('#compiler').SvelteFragment | import('#compiler').SvelteSelf}
 */
export function is_element_node(node) {
	return element_nodes.includes(node.type);
}

/**
 * @param {import('#compiler').RegularElement | import('#compiler').SvelteElement} node
 * @returns {boolean}
 */
export function is_custom_element_node(node) {
	return node.type === 'RegularElement' && node.name.includes('-');
}

/**
 * @param {string} name
 * @param {number} start
 * @param {number} end
 * @param {true | Array<import('#compiler').Text | import('#compiler').ExpressionTag>} value
 * @returns {import('#compiler').Attribute}
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
