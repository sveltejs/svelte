/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '#compiler/builders';
import { process_children, build_template } from './shared/utils.js';

/**
 * @param {AST.TitleElement} node
 * @param {ComponentContext} context
 */
export function TitleElement(node, context) {
	// title is guaranteed to contain only text/expression tag children
	const template = [b.literal('<title>')];
	process_children(node.fragment.nodes, { ...context, state: { ...context.state, template } });
	template.push(b.literal('</title>'));

	if (!node.metadata.has_await) {
		context.state.init.push(...build_template(template, b.id('$$payload.title.value'), '='));
	} else {
		const async_template = b.thunk(
			// TODO I'm sure there is a better way to do this
			b.block([
				b.let('title'),
				...build_template(template, b.id('title'), '='),
				b.return(b.id('title'))
			]),
			true
		);
		context.state.init.push(
			b.stmt(b.assignment('=', b.id('$$payload.title.value'), b.call(async_template)))
		);
	}
}
