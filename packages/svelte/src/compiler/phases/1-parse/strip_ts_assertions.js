import { walk } from 'zimmerframe';

/**
 * @type {import('zimmerframe').Visitor<any, null, any>}
 */
function unwrap_expression_visitor(node, { visit }) {
	return visit(node.expression);
}

/** @type {import('zimmerframe').Visitors<any, null>} */
const visitors = {
	TSAsExpression: unwrap_expression_visitor,
	TSNonNullExpression: unwrap_expression_visitor,
	TSSatisfiesExpression: unwrap_expression_visitor
};

/**
 * @template T
 * @param {T} ast
 * @returns {T}
 */
export function strip_ts_assertions(ast) {
	return walk(ast, null, visitors);
}
