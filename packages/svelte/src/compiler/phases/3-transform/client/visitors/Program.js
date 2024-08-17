/** @import { Expression, ImportDeclaration, MemberExpression, Program } from 'estree' */
/** @import { ComponentContext } from '../types' */
import { build_getter, is_prop_source } from '../utils.js';
import * as b from '../../../../utils/builders.js';
import { add_state_transformers } from './shared/declarations.js';

/**
 * @param {Program} _
 * @param {ComponentContext} context
 */
export function Program(_, context) {
	if (!context.state.analysis.runes) {
		context.state.transform['$$props'] = {
			read: (node) => ({ ...node, name: '$$sanitized_props' })
		};

		for (const [name, binding] of context.state.scope.declarations) {
			if (binding.declaration_kind === 'import' && binding.mutated) {
				// the declaration itself is hoisted to the module scope, so we need
				// to resort to cruder measures to differentiate instance/module imports
				const { start, end } = context.state.analysis.instance.ast;
				const node = /** @type {ImportDeclaration} */ (binding.initial);
				const is_instance_import =
					/** @type {number} */ (node.start) > /** @type {number} */ (start) &&
					/** @type {number} */ (node.end) < /** @type {number} */ (end);

				if (is_instance_import) {
					const id = b.id('$$_import_' + name);

					context.state.transform[name] = {
						read: (_) => b.call(id),
						mutate: (_, mutation) => b.call(id, mutation)
					};

					context.state.legacy_reactive_imports.push(
						b.var(id, b.call('$.reactive_import', b.thunk(b.id(name))))
					);
				}
			}
		}
	}

	for (const [name, binding] of context.state.scope.declarations) {
		if (binding.kind === 'store_sub') {
			const store = /** @type {Expression} */ (context.visit(b.id(name.slice(1))));

			context.state.transform[name] = {
				read: b.call,
				assign: (_, value) => b.call('$.store_set', store, value),
				mutate: (node, mutation) => {
					// We need to untrack the store read, for consistency with Svelte 4
					const untracked = b.call('$.untrack', node);

					/**
					 *
					 * @param {Expression} n
					 * @returns {Expression}
					 */
					function replace(n) {
						if (n.type === 'MemberExpression') {
							return {
								...n,
								object: replace(/** @type {Expression} */ (n.object)),
								property: n.property
							};
						}

						return untracked;
					}

					return b.call(
						'$.store_mutate',
						store,
						b.assignment(
							mutation.operator,
							/** @type {MemberExpression} */ (
								replace(/** @type {MemberExpression} */ (mutation.left))
							),
							mutation.right
						),
						untracked
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
				context.state.transform[name] = {
					read: b.call,
					assign: b.call,
					mutate: (node, value) => {
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

				context.state.transform[name] = {
					read: (_) => b.member(b.id('$$props'), key, key.type === 'Literal')
				};
			} else {
				context.state.transform[name] = {
					read: (node) => b.member(b.id('$$props'), node)
				};
			}
		}
	}

	add_state_transformers(context);

	context.next();
}
