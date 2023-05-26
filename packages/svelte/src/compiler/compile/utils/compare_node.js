/**
 * @param {import('estree').Node | void} a
 * @param {import('estree').Node | void} b
 */
export function compare_node(a, b) {
	if (a === b) return true;
	if (!a || !b) return false;
	if (a.type !== b.type) return false;
	switch (a.type) {
		case 'Identifier':
			return a.name === /** @type {import('estree').Identifier} */ (b).name;
		case 'MemberExpression':
			return (
				compare_node(a.object, /** @type {import('estree').MemberExpression} */ (b).object) &&
				compare_node(a.property, /** @type {import('estree').MemberExpression} */ (b).property) &&
				a.computed === /** @type {import('estree').MemberExpression} */ (b).computed
			);
		case 'Literal':
			return a.value === /** @type {import('estree').Literal} */ (b).value;
	}
}
