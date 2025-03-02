/**
 * @param {import("#compiler").AST.BaseNode} node
 * @param {import("../types").Context["path"]} path
 */
export function props_id_needs_hydration(node, path) {
	return (
		path.length === 1 &&
		path[0].type === 'Fragment' &&
		path[0].nodes &&
		first_non_blank_text(path[0]) === node
	);
}

/**
 * @param {import("#compiler").AST.Fragment} fragment
 */
function first_non_blank_text(fragment) {
	return fragment.nodes[0].type === 'Text' && fragment.nodes[0].data.trim() !== ''
		? fragment.nodes[0]
		: fragment.nodes[1];
}
