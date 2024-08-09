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
						assign: (node, visit) => {
							let left = /** @type {Identifier} */ (node.left);
							let value = /** @type {Expression} */ (visit(node.right));

							if (node.operator !== '=') {
								value = b.binary(
									/** @type {BinaryOperator} */ (node.operator.slice(0, -1)),
									/** @type {Expression} */ (visit(left)),
									value
								);
							}

							if (
								context.state.analysis.runes &&
								binding.kind === 'bindable_prop' &&
								should_proxy_or_freeze(value, context.state.scope)
							) {
								value = build_proxy_reassignment(value, left.name);
							}

							return b.call(left, value);
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
