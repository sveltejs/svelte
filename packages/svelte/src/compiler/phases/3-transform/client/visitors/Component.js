/** @import { Expression } from 'estree' */
/** @import { Component } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';
import { build_component } from './shared/component.js';

/**
 * @param {Component} node
 * @param {ComponentContext} context
 */
export function Component(node, context) {
	if (node.metadata.dynamic) {
		// Handle dynamic references to what seems like static inline components
		const component = build_component(node, '$$component', context, b.id('$$anchor'));
		context.state.init.push(
			b.stmt(
				b.call(
					'$.component',
					context.state.node,
					// TODO use untrack here to not update when binding changes?
					// Would align with Svelte 4 behavior, but it's arguably nicer/expected to update this
					b.thunk(/** @type {Expression} */ (context.visit(b.member_id(node.name)))),
					b.arrow([b.id('$$anchor'), b.id('$$component')], b.block([component]))
				)
			)
		);
		return;
	}

	const component = build_component(node, node.name, context);
	context.state.init.push(component);
}
