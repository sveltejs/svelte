/** @import { BlockStatement, Statement, Property, Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */

import * as b from '../../../../utils/builders.js';
/**
 * @param {AST.SvelteBoundary} node
 * @param {ComponentContext} context
 */
export function SvelteBoundary(node, context) {
	const nodes = [];
	/** @type {Statement[]} */
	const snippet_statements = [];
	/** @type {Array<Property[]>} */
	const props = [];

	const push_prop = (/** @type {Property} */ prop) => {
		let current = props.at(-1);
		if (Array.isArray(current)) {
			current.push(prop);
		}
		const arr = [prop];
		props.push(arr);
	};

	for (const attribute of node.attributes) {
		// Skip non-attributes with a single value
		if (
			attribute.type !== 'Attribute' ||
			attribute.value === true ||
			Array.isArray(attribute.value)
		) {
			continue;
		}

		// Currently we only support `onerror` and `failed` props
		if (attribute.name === 'onerror' || attribute.name === 'failed') {
			const value = /** @type {Expression} */ (
				context.visit(attribute.value.expression, context.state)
			);

			if (attribute.metadata.expression.has_state) {
				push_prop(
					b.prop('get', b.id(attribute.name), b.function(null, [], b.block([b.return(value)])))
				);
			} else {
				push_prop(b.prop('init', b.id(attribute.name), value));
			}
		}
	}

	// Capture the `failed` implicit snippet prop
	for (const child of node.fragment.nodes) {
		if (child.type === 'SnippetBlock' && child.expression.name === 'failed') {
			/** @type {Statement[]} */
			const init = [];
			const block_state = { ...context.state, init };
			context.visit(child, block_state);
			push_prop(b.prop('init', b.id('failed'), b.id('failed')));
			snippet_statements.push(...init);
		} else {
			nodes.push(child);
		}
	}

	const block = /** @type {BlockStatement} */ (
		context.visit(
			{
				...node.fragment,
				nodes
			},
			{ ...context.state }
		)
	);

	const props_expression = b.object(props.length === 0 ? [] : props[0]);
	const boundary = b.stmt(
		b.call('$.boundary', context.state.node, props_expression, b.arrow([b.id('$$anchor')], block))
	);

	context.state.template.push('<!>');
	context.state.init.push(
		snippet_statements.length > 0 ? b.block([...snippet_statements, boundary]) : boundary
	);
}
