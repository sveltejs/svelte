/** @import { Node, Program } from 'estree' */
/** @import { Context, ComponentContext } from '../types' */
import * as b from '#compiler/builders';
import { runes } from '../../../../state.js';
import { transform_body } from '../../shared/transform-async.js';

/**
 * @param {Program} node
 * @param {Context} context
 */
export function Program(node, context) {
	if (context.state.is_instance && runes) {
		// @ts-ignore wtf
		const c = /** @type {ComponentContext} */ (context);

		return {
			...node,
			body: transform_body(
				node,
				c.state.analysis.instance_body,
				b.id('$$renderer.run'),
				(node) => /** @type {Node} */ (context.visit(node)),
				(statement) => c.state.hoisted.push(statement)
			)
		};
	}

	context.next();
}
