/** @import { Node, Program } from 'estree' */
/** @import { Context, ComponentServerTransformState } from '../types' */
import * as b from '#compiler/builders';
import { transform_body } from '../../shared/transform-async.js';

/**
 * @param {Program} node
 * @param {Context} context
 */
export function Program(node, context) {
	if (context.state.is_instance) {
		const state = /** @type {ComponentServerTransformState} */ (context.state);

		return {
			...node,
			body: transform_body(
				state.analysis.instance_body,
				b.id('$$renderer.run'),
				(node) => /** @type {Node} */ (context.visit(node))
			)
		};
	}

	context.next();
}
