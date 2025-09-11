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
		call_child_payload(
			b.block([
				b.const('path', b.call('$$payload.get_path')),
				b.let('title'),
				...build_template(template, b.id('title'), '='),
				b.stmt(
					b.assignment(
						'=',
						b.id('$$payload.global.head.title'),
						b.object([b.init('path', b.id('path')), b.init('value', b.id('title'))])
					)
				)
			]),
			node.metadata.has_await
		)
	);
}
