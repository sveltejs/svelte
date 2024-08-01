/** @import { Text } from '#compiler' */
/** @import { ComponentVisitors } from '../types.js' */
import * as b from '../../../../utils/builders.js';
import { javascript_visitors_runes } from './javascript-runes.js';
import { serialize_template_literal } from './shared/utils.js';

/** @type {ComponentVisitors} */
export const template_visitors = {
	TitleElement(node, { state, visit }) {
		// TODO throw validation error when attributes present / when children something else than text/expression tags
		if (node.fragment.nodes.length === 1 && node.fragment.nodes[0].type === 'Text') {
			state.init.push(
				b.stmt(
					b.assignment(
						'=',
						b.member(b.id('$.document'), b.id('title')),
						b.literal(/** @type {Text} */ (node.fragment.nodes[0]).data)
					)
				)
			);
		} else {
			state.update.push(
				b.stmt(
					b.assignment(
						'=',
						b.member(b.id('$.document'), b.id('title')),
						serialize_template_literal(/** @type {any} */ (node.fragment.nodes), visit, state)[1]
					)
				)
			);
		}
	},
	SvelteBody(node, context) {
		context.next({
			...context.state,
			node: b.id('$.document.body')
		});
	},
	SvelteWindow(node, context) {
		context.next({
			...context.state,
			node: b.id('$.window')
		});
	},
	SvelteDocument(node, context) {
		context.next({
			...context.state,
			node: b.id('$.document')
		});
	},
	CallExpression: javascript_visitors_runes.CallExpression,
	VariableDeclaration: javascript_visitors_runes.VariableDeclaration
};
