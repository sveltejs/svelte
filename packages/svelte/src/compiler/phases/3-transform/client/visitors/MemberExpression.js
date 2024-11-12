/** @import { MemberExpression, Expression, Super, PrivateIdentifier } from 'estree' */
/** @import { Context } from '../types' */
import { dev } from '../../../../state.js';
import * as b from '../../../../utils/builders.js';
import { trace } from '../utils.js';

/**
 * @param {MemberExpression} node
 * @param {Context} context
 */
export function MemberExpression(node, context) {
	let transformed;
	// rewrite `this.#foo` as `this.#foo.v` inside a constructor
	if (node.property.type === 'PrivateIdentifier') {
		const field = context.state.private_state.get(node.property.name);
		if (field) {
			transformed = context.state.in_constructor ? b.member(node, 'v') : b.call('$.get', node);
		}
	}

	const parent = context.path.at(-1);

	if (
		dev &&
		// Bail out of tracing members if they're used as calees to avoid context issues
		(parent?.type !== 'CallExpression' || parent.callee !== node) &&
		parent?.type !== 'BindDirective' &&
		parent?.type !== 'AssignmentExpression' &&
		parent?.type !== 'UpdateExpression' &&
		parent?.type !== 'Component'
	) {
		return trace(
			node,
			transformed || {
				...node,
				object: /** @type {Expression | Super} */ (context.visit(node.object)),
				property: /** @type {Expression | PrivateIdentifier} */ (context.visit(node.property))
			},
			context.state
		);
	} else if (transformed) {
		return transformed;
	}

	context.next();
}
