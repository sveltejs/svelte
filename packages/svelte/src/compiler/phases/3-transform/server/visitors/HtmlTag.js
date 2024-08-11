/** @import { Expression } from 'estree' */
/** @import { HtmlTag } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '../../../../utils/builders.js';

/**
 * @param {HtmlTag} node
 * @param {ComponentContext} context
 */
export function HtmlTag(node, context) {
	const expression = /** @type {Expression} */ (context.visit(node.expression));
	context.state.template.push(b.call('$.html', expression));
}
