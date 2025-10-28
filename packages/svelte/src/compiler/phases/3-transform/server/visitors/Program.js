/** @import { Declaration, Program, Statement, VariableDeclaration } from 'estree' */
/** @import { Context } from '../types.js' */

/**
 * @param {Program} node
 * @param {Context} context
 */
export function Program(node, context) {
	/** @type {Program['body']} */
	const body = [];
	for (const child of node.body) {
		const visited = /** @type {Declaration | Statement} */ (context.visit(child));
		if (
			visited.type === 'ClassDeclaration' &&
			'metadata' in visited &&
			visited.metadata !== null &&
			typeof visited.metadata === 'object' &&
			'computed_field_declarations' in visited.metadata
		) {
			body.push(
				.../** @type {VariableDeclaration[]} */ (visited.metadata.computed_field_declarations)
			);
		}
		body.push(visited);
	}

	return {
		...node,
		body
	};
}
