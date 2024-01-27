/**
 *
 * @param {import("estree").Expression} expression
 * @returns {expression is import('#compiler').ChainCallExpression}
 */
export function isChainCallExpression(expression) {
	return expression.type === 'ChainExpression' && expression.expression.type === 'CallExpression';
}
