/**
 * @param {string} name
 */
export function string_to_member_expression(name) {
	const parts = name.split('.');
	/** @type {import('estree').MemberExpression | import('estree').Identifier} */
	let node = {
		type: 'Identifier',
		name: parts[0]
	};
	for (let i = 1; i < parts.length; i++) {
		node = /** @type {import('estree').MemberExpression} */ ({
			type: 'MemberExpression',
			object: node,
			property: { type: 'Identifier', name: parts[i] }
		});
	}
	return node;
}
