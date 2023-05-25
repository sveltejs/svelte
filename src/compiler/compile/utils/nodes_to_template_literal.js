/**
 * Transforms a list of Text and MustacheTags into a TemplateLiteral expression.
 * Start/End positions on the elements of the expression are not set.
 * @param {Array<import('../../interfaces.js').Text | import('../../interfaces.js').MustacheTag>} value
 * @returns {import('estree').TemplateLiteral}
 */
export function nodes_to_template_literal(value) {
	/**
	 * @type {import('estree').TemplateLiteral}
	 */
	const literal = {
		type: 'TemplateLiteral',
		expressions: [],
		quasis: []
	};

	/**
	 * @type {import('estree').TemplateElement}
	 */
	let quasi = {
		type: 'TemplateElement',
		value: { raw: '', cooked: null },
		tail: false
	};
	value.forEach((node) => {
		if (node.type === 'Text') {
			quasi.value.raw += node.raw;
		} else if (node.type === 'MustacheTag') {
			literal.quasis.push(quasi);
			literal.expressions.push(/** @type {any} */ (node.expression));
			quasi = {
				type: 'TemplateElement',
				value: { raw: '', cooked: null },
				tail: false
			};
		}
	});
	quasi.tail = true;
	literal.quasis.push(quasi);
	return literal;
}
