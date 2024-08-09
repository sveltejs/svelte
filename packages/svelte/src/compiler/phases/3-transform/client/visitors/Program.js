/** @import { BinaryOperator, Expression, Identifier, Program } from 'estree' */
/** @import { ComponentContext } from '../types' */
import {
	build_getter,
	build_proxy_reassignment,
	is_prop_source,
	should_proxy_or_freeze
} from '../utils.js';
import * as b from '../../../../utils/builders.js';
import { add_state_transformers } from './shared/declarations.js';

/**
 * @param {Program} node
 * @param {ComponentContext} context
 */
export function Program(node, context) {
	if (context.state.is_instance) {
		for (const [name, binding] of context.state.scope.declarations) {
			if (binding.kind === 'store_sub') {
				context.state.transformers[name] = {
					read: b.call,
					assign: (node, value) => {
						return b.call(
							'$.store_set',
							/** @type {Expression} */ (context.visit(b.id(node.name.slice(1)))),
							value
						);
					},
					update: (node) => {
						return b.call(
							node.prefix ? '$.update_pre_store' : '$.update_store',
							build_getter(b.id(name.slice(1)), context.state),
							b.call(node.argument),
							node.operator === '--' && b.literal(-1)
						);
					}
				};
			}

			if (binding.kind === 'prop' || binding.kind === 'bindable_prop') {
				if (is_prop_source(binding, context.state)) {
					context.state.transformers[name] = {
						read: b.call,
						assign: (node, value) => {
							return b.call(node, value);
						},
						assign_property: (node, value) => {
							if (binding.kind === 'bindable_prop') {
								// only necessary for interop with legacy parent bindings
								return b.call(node, value, b.true);
							}

							return value;
						},
						update: (node) => {
							return b.call(
								node.prefix ? '$.update_pre_prop' : '$.update_prop',
								node.argument,
								node.operator === '--' && b.literal(-1)
							);
						}
					};
				} else if (binding.prop_alias) {
					const key = b.key(binding.prop_alias);
					context.state.transformers[name] = {
						read: (node) => b.member(b.id('$$props'), key, key.type === 'Literal')
					};
				} else {
					context.state.transformers[name] = {
						read: (node) => b.member(b.id('$$props'), node)
					};
				}
			}
		}
	}

	add_state_transformers(context);

	context.next();
}
