/**
 * @param {import('estree').Node} node
 */
export default function flatten_reference(node) {
	/** @type {any[]} */
	const nodes = [];
	/** @type {string[]} */
	const parts = [];

	while (node.type === 'MemberExpression') {
		nodes.unshift(node.property);

		if (!node.computed) {
			parts.unshift(/** @type {import('estree').Identifier} */ (node.property).name);
		} else {
			const computed_property = to_string(node.property);
			if (computed_property) {
				parts.unshift(`[${computed_property}]`);
			}
		}
		node = node.object;
	}

	const name =
		node.type === 'Identifier' ? node.name : node.type === 'ThisExpression' ? 'this' : null;

	nodes.unshift(node);

	parts.unshift(name);

	return { name, nodes, parts };
}

/**
 * @param {import('estree').Node} node
 */
function to_string(node) {
	switch (node.type) {
		case 'Literal':
			return String(node.value);
		case 'Identifier':
			return node.name;
	}
}
