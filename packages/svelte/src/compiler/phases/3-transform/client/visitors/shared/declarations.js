/** @import { Expression, Identifier } from 'estree' */
/** @import { Location } from 'locate-character' */
/** @import { ComponentContext, Context } from '../../types' */
import { is_state_source } from '../../utils.js';
import * as b from '../../../../../utils/builders.js';
import { dev, filename, locator } from '../../../../../state.js';

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
			is_state_source(binding, context.state.analysis) ||
			binding.kind === 'derived' ||
			binding.kind === 'legacy_reactive'
		) {
			context.state.transform[name] = {
				read: binding.declaration_kind === 'var' ? (node) => b.call('$.safe_get', node) : get_value,
				assign: (node, value) => {
					/** @type {Expression} */
					let call = b.call('$.set', node, value);

					const loc = dev && node.start !== undefined && locator(node.start);

					if (loc) {
						call = b.sequence([
							b.call('$.track_assignment', b.literal(`${filename}:${loc.line}:${loc.column}`)),
							call
						]);
					}

					if (context.state.scope.get(`$${node.name}`)?.kind === 'store_sub') {
						call = b.call('$.store_unsub', call, b.literal(`$${node.name}`), b.id('$$stores'));
					}

					return call;
				},
				mutate: (node, mutation) => {
					if (context.state.analysis.runes) {
						return mutation;
					}

					return b.call('$.mutate', node, mutation);
				},
				update: (node) => {
					/** @type {Expression} */
					let call = b.call(
						node.prefix ? '$.update_pre' : '$.update',
						node.argument,
						node.operator === '--' && b.literal(-1)
					);

					const loc = dev && node.start !== undefined && locator(node.start);

					if (loc) {
						call = b.sequence([
							b.call('$.track_assignment', b.literal(`${filename}:${loc.line}:${loc.column}`)),
							call
						]);
					}

					return call;
				}
			};
		}
	}
}
