import { flatten } from './flatten.js';
import { regex_whitespace } from './patterns.js';

const regex_svelte_ignore = /^\s*svelte-ignore\s+([\s\S]+)\s*$/m;

/**
 * @param {string} text
 * @returns {string[]}
 */
export function extract_svelte_ignore(text) {
	const match = regex_svelte_ignore.exec(text);
	return match
		? match[1]
				.split(regex_whitespace)
				.map((x) => x.trim())
				.filter(Boolean)
		: [];
}

/**
 * @param {import('estree').Node} node
 * @returns {string[]}
 */
export function extract_svelte_ignore_from_comments(node) {
	return flatten(
		(node.leadingComments || []).map((comment) => extract_svelte_ignore(comment.value))
	);
}

/**
 * @param {number} position
 * @param {import('../interfaces.js').TemplateNode[]} template_nodes
 * @returns {string[]}
 */
export function extract_ignores_above_position(position, template_nodes) {
	const previous_node_idx = template_nodes.findIndex((child) => child.end === position);
	if (previous_node_idx === -1) {
		return [];
	}
	for (let i = previous_node_idx; i >= 0; i--) {
		const node = template_nodes[i];
		if (node.type !== 'Comment' && node.type !== 'Text') {
			return [];
		}
		if (node.type === 'Comment') {
			if (node.ignores.length) {
				return node.ignores;
			}
		}
	}
	return [];
}

/**
 * @param {import('../compile/nodes/interfaces.js').INode} node
 * @returns {string[]}
 */
export function extract_ignores_above_node(node) {
	/**
	 * This utilizes the fact that node has a prev and a next attribute
	 * which means that it can find svelte-ignores along
	 * the nodes on the same level as itself who share the same parent.
	 */
	let cur_node = node.prev;
	while (cur_node) {
		if (cur_node.type !== 'Comment' && cur_node.type !== 'Text') {
			return [];
		}
		if (cur_node.type === 'Comment' && cur_node.ignores.length) {
			return cur_node.ignores;
		}
		cur_node = cur_node.prev;
	}
	return [];
}
