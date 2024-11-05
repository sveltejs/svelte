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
	/** @type {Array<Property[] | Expression>} */
	const props_and_spreads = [];

	let has_spread = false;

	const push_prop = (/** @type {Property} */ prop) => {
		let current = props_and_spreads.at(-1);
		if (Array.isArray(current)) {
			current.push(prop);
		}
		const arr = [prop];
		props_and_spreads.push(arr);
	};

	for (const attribute of node.attributes) {
		if (attribute.type === 'SpreadAttribute') {
			const value = /** @type {Expression} */ (context.visit(attribute.expression, context.state));
			has_spread = true;

			if (attribute.metadata.expression.has_state) {
				props_and_spreads.push(b.thunk(value));
			} else {
				props_and_spreads.push(value);
			}
			continue;
		}

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

	const props_expression =
		!has_spread && Array.isArray(props_and_spreads[0])
			? b.object(props_and_spreads[0])
			: props_and_spreads.length === 0
				? b.object([])
				: b.call(
						'$.spread_props',
						...props_and_spreads.map((p) => (Array.isArray(p) ? b.object(p) : p))
					);

	const boundary = b.stmt(
		b.call('$.boundary', context.state.node, b.arrow([b.id('$$anchor')], block), props_expression)
	);

	context.state.template.push('<!>');
	context.state.init.push(
		snippet_statements ? b.block([...snippet_statements, boundary]) : boundary
	);
}
