import { regex_whitespace } from '../phases/patterns.js';

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
				.map(/** @param {any} x */ (x) => x.trim())
				.filter(Boolean)
		: [];
}

/**
 * @template {{ leadingComments?: Array<{ value: string }> }} Node
 * @param {Node} node
 * @returns {string[]}
 */
export function extract_svelte_ignore_from_comments(node) {
	return (node.leadingComments || []).flatMap(
		/** @param {any} comment */ (comment) => extract_svelte_ignore(comment.value)
	);
}

/**
 * @param {import('#compiler').TemplateNode} node
 * @param {import('#compiler').TemplateNode[]} template_nodes
 * @returns {string[]}
 */
export function extract_ignores_above_position(node, template_nodes) {
	const previous_node_idx = template_nodes.indexOf(node) - 1;
	if (previous_node_idx < 0) {
		return [];
	}

	const ignores = [];
	for (let i = previous_node_idx; i >= 0; i--) {
		const node = template_nodes[i];
		if (node.type !== 'Comment' && node.type !== 'Text') {
			return ignores;
		}
		if (node.type === 'Comment') {
			if (node.ignores.length) {
				ignores.push(...node.ignores);
			}
		}
	}

	return ignores;
}
