/** @import { Declaration, Statement, StaticBlock, VariableDeclaration } from 'estree' */
/** @import { Context } from '../types' */

/**
 * @param {StaticBlock} node
 * @param {Context} context
 */
export function StaticBlock(node, context) {
	/** @type {StaticBlock['body']} */
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
