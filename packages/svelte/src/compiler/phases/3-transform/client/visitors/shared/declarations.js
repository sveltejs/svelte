/** @import { BinaryOperator, Expression, Identifier } from 'estree' */
/** @import { ComponentContext, Context } from '../../types' */
import { build_proxy_reassignment, is_state_source, should_proxy_or_freeze } from '../../utils.js';
import * as b from '../../../../../utils/builders.js';

/**
 * Turns `foo` into `$.get(foo)`
 * @param {Identifier} node
 */
export function get_value(node) {
	return b.call('$.get', node);
}

/**
 *
 * @param {Context | ComponentContext} context
 */
export function add_state_transformers(context) {
	for (const [name, binding] of context.state.scope.declarations) {
		if (
			is_state_source(binding, context.state) ||
			binding.kind === 'derived' ||
			binding.kind === 'legacy_reactive'
		) {
			context.state.transformers[name] = {
				read: get_value,
				assign: (node, visit, is_primitive) => {
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
						!is_primitive &&
						context.state.analysis.runes &&
						should_proxy_or_freeze(value, context.state.scope)
					) {
						if (binding.kind === 'frozen_state') {
							value = b.call('$.freeze', value);
						} else {
							value = build_proxy_reassignment(value, left.name);
						}
					}

					let call = b.call('$.set', left, value);

					if (context.state.scope.get(`$${left.name}`)?.kind === 'store_sub') {
						call = b.call('$.store_unsub', call, b.literal(`$${left.name}`), b.id('$$stores'));
					}

					return call;
				},
				update: (node) => {
					return b.call(
						node.prefix ? '$.update_pre' : '$.update',
						node.argument,
						node.operator === '--' && b.literal(-1)
					);
				}
			};
		}
	}
}
