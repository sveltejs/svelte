/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '#compiler/builders';
import { process_children, build_template, call_child_payload } from './shared/utils.js';

/**
 * @param {AST.TitleElement} node
 * @param {ComponentContext} context
 */
export function TitleElement(node, context) {
	// title is guaranteed to contain only text/expression tag children
	const template = [b.literal('<title>')];
	process_children(node.fragment.nodes, { ...context, state: { ...context.state, template } });
	template.push(b.literal('</title>'));

	context.state.init.push(
		b.stmt(
			b.call(
				'$.build_title',
				b.id('$$payload'),
				b.thunk(b.block(build_template(template)), node.metadata.has_await)
			)
		)
	);
}
