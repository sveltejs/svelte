/** @import { Location } from 'locate-character' */
/** @import { BlockStatement, Expression, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import { dev, locator } from '../../../../state.js';
import * as b from '#compiler/builders';
import { determine_namespace_for_children } from '../../utils.js';
import { build_element_attributes } from './shared/element.js';
import {
	build_template,
	create_async_block,
	create_child_block,
	PromiseOptimiser
} from './shared/utils.js';

/**
 * @param {AST.SvelteElement} node
 * @param {ComponentContext} context
 */
export function SvelteElement(node, context) {
	let tag = /** @type {Expression} */ (context.visit(node.tag));

	if (dev) {
		// Ensure getters/function calls aren't called multiple times.
		// If we ever start referencing `tag` more than once in prod, move this out of the if block.
		if (tag.type !== 'Identifier') {
			const tag_id = context.state.scope.generate('$$tag');
			context.state.init.push(b.const(tag_id, tag));
			tag = b.id(tag_id);
		}

		if (node.fragment.nodes.length > 0) {
			context.state.init.push(b.stmt(b.call('$.validate_void_dynamic_element', b.thunk(tag))));
		}
		context.state.init.push(b.stmt(b.call('$.validate_dynamic_element_tag', b.thunk(tag))));
	}

	const state = {
		...context.state,
		namespace: determine_namespace_for_children(node, context.state.namespace),
		template: [],
		init: []
	};

	const optimiser = new PromiseOptimiser();

	/** @type {Statement[]} */
	let statements = [];

	build_element_attributes(node, { ...context, state }, optimiser.transform);

	if (dev) {
		const location = /** @type {Location} */ (locator(node.start));
		statements.push(
			b.stmt(
				b.call(
					'$.push_element',
					b.id('$$renderer'),
					tag,
					b.literal(location.line),
					b.literal(location.column)
				)
			)
		);
	}

	const attributes = b.block([...state.init, ...build_template(state.template)]);
	const children = /** @type {BlockStatement} */ (context.visit(node.fragment, state));

	/** @type {Statement} */
	let statement = b.stmt(
		b.call(
			'$.element',
			b.id('$$renderer'),
			tag,
			attributes.body.length > 0 && b.thunk(attributes),
			children.body.length > 0 && b.thunk(children)
		)
	);

	if (optimiser.expressions.length > 0) {
		statement = create_child_block(b.block([optimiser.apply(), statement]), true);
	}

	statements.push(statement);

	if (dev) {
		statements.push(b.stmt(b.call('$.pop_element')));
	}

	if (node.metadata.expression.is_async()) {
		statements = [
			create_async_block(
				b.block(statements),
				node.metadata.expression.blockers(),
				node.metadata.expression.has_await
			)
		];
	}

	context.state.template.push(...statements);
}
