/** @import { TitleElement, Text } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';
import { build_template_literal } from './shared/utils.js';

/**
 * @param {TitleElement} node
 * @param {ComponentContext} context
 */
export function TitleElement(node, context) {
	// TODO throw validation error when attributes present / when children something else than text/expression tags
	// TODO only create update when expression is dynamic

	if (node.fragment.nodes.length === 1 && node.fragment.nodes[0].type === 'Text') {
		context.state.init.push(
			b.stmt(
				b.assignment(
					'=',
					b.member(b.id('$.document'), b.id('title')),
					b.literal(/** @type {Text} */ (node.fragment.nodes[0]).data)
				)
			)
		);
	} else {
		context.state.update.push(
			b.stmt(
				b.assignment(
					'=',
					b.member(b.id('$.document'), b.id('title')),
					build_template_literal(
						/** @type {any} */ (node.fragment.nodes),
						context.visit,
						context.state
					)[1]
				)
			)
		);
	}
}
