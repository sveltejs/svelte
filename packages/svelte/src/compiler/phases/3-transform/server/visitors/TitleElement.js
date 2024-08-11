/** @import { TitleElement } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '../../../../utils/builders.js';
import { process_children, build_template } from './shared/utils.js';

/**
 * @param {TitleElement} node
 * @param {ComponentContext} context
 */
export function TitleElement(node, context) {
	// title is guaranteed to contain only text/expression tag children
	const template = [b.literal('<title>')];
	process_children(node.fragment.nodes, { ...context, state: { ...context.state, template } });
	template.push(b.literal('</title>'));

	context.state.init.push(...build_template(template, b.id('$$payload.title'), '='));
}
