/** @import { AwaitExpression, CallExpression, Expression, Identifier, Literal, Node, Program, VariableDeclaration, VariableDeclarator } from 'estree' */
/** @import { Binding } from '#compiler' */
/** @import { ComponentContext, ParallelizedChunk } from '../types' */
import { dev, is_ignored, locate_node } from '../../../../state.js';
import { extract_paths, is_expression_async, save } from '../../../../utils/ast.js';
import * as b from '#compiler/builders';
import * as assert from '../../../../utils/assert.js';
import { get_rune } from '../../../scope.js';
import {
	can_be_parallelized,
	get_prop_source,
	is_prop_source,
	is_state_source,
	should_proxy
} from '../utils.js';
import { is_hoisted_function } from '../../utils.js';
import { get_value } from './shared/declarations.js';

/**
 * @param {VariableDeclaration} node
 * @param {ComponentContext} context
 */
export function VariableDeclaration(node, context) {
	/** @type {VariableDeclarator[]} */
	const declarations = [];
	const parent = /** @type {Node} */ (context.path.at(-1));
	const position = /** @type {Program} */ (parent).body?.indexOf?.(node);

	if (context.state.analysis.runes) {
		for (const declarator of node.declarations) {
			const init = /** @type {Expression} */ (declarator.init);
			const rune = get_rune(init, context.state.scope);
			const bindings = context.state.scope.get_bindings(declarator);
			if (
				!rune ||
				rune === '$effect.tracking' ||
				rune === '$effect.root' ||
				rune === '$inspect' ||
				rune === '$inspect.trace' ||
				rune === '$state.snapshot' ||
				rune === '$host'
			) {
				if (init != null && is_hoisted_function(init)) {
					context.state.hoisted.push(
						b.const(declarator.id, /** @type {Expression} */ (context.visit(init)))
					);

					continue;
				}
				const kind = node.kind;
				if (
					kind !== 'using' && kind !== 'await using' &&
					init?.type === 'AwaitExpression' &&
					context.state.analysis.instance?.scope === context.state.scope &&
					!is_expression_async(init.argument)
				) {
					const current_chunk = context.state.current_parallelized_chunk;
					const parallelize = can_be_parallelized(
						init.argument,
						context.state.scope,
						context.state.analysis,
						[...(current_chunk?.bindings ?? []), ...bindings]
					);
					if (parallelize) {
						const { id, init: visited_init } = /** @type {VariableDeclarator} */ (
							context.visit({
								...declarator,
								init: init.argument
							})
						);
						const _declarator = {
							id,
							init: /** @type {Expression} */ (visited_init)
						};
						if (
							current_chunk &&
							(current_chunk.kind === kind || current_chunk.kind === null)
						) {
							current_chunk.declarators.push(_declarator);
							current_chunk.bindings.push(...bindings);
							current_chunk.position = /** @type {Program} */ (parent).body.indexOf(node);
							current_chunk.kind = kind;
						} else {
							/** @type {ParallelizedChunk} */
							const chunk = {
								kind,
								declarators: [_declarator],
								position,
								bindings
							};
							context.state.current_parallelized_chunk = chunk;
							context.state.parallelized_chunks.push(chunk);
						}
						continue;
					}
				}
				declarations.push(/** @type {VariableDeclarator} */ (context.visit(declarator)));
				continue;
			}

			if (rune === '$props.id') {
				// skip
				continue;
			}

			if (rune === '$props') {
				/** @type {string[]} */
				const seen = ['$$slots', '$$events', '$$legacy'];

				if (context.state.analysis.custom_element) {
					seen.push('$$host');
				}

				if (declarator.id.type === 'Identifier') {
					/** @type {Expression[]} */
					const args = [b.id('$$props'), b.array(seen.map((name) => b.literal(name)))];

					if (dev) {
						// include rest name, so we can provide informative error messages
						args.push(b.literal(declarator.id.name));
					}

					declarations.push(b.declarator(declarator.id, b.call('$.rest_props', ...args)));
				} else {
					assert.equal(declarator.id.type, 'ObjectPattern');

					for (const property of declarator.id.properties) {
						if (property.type === 'Property') {
							const key = /** @type {Identifier | Literal} */ (property.key);
							const name = key.type === 'Identifier' ? key.name : /** @type {string} */ (key.value);

							seen.push(name);

							let id =
								property.value.type === 'AssignmentPattern' ? property.value.left : property.value;
							assert.equal(id.type, 'Identifier');
							const binding = /** @type {Binding} */ (context.state.scope.get(id.name));
							let initial =
								binding.initial && /** @type {Expression} */ (context.visit(binding.initial));
							// We're adding proxy here on demand and not within the prop runtime function so that
							// people not using proxied state anywhere in their code don't have to pay the additional bundle size cost
							if (
								initial &&
								binding.kind === 'bindable_prop' &&
								should_proxy(initial, context.state.scope)
							) {
								initial = b.call('$.proxy', initial);

								if (dev) {
									initial = b.call('$.tag_proxy', initial, b.literal(id.name));
								}
							}

							if (is_prop_source(binding, context.state)) {
								declarations.push(
									b.declarator(id, get_prop_source(binding, context.state, name, initial))
								);
							}
						} else {
							// RestElement
							/** @type {Expression[]} */
							const args = [b.id('$$props'), b.array(seen.map((name) => b.literal(name)))];

							if (dev) {
								// include rest name, so we can provide informative error messages
								args.push(b.literal(/** @type {Identifier} */ (property.argument).name));
							}

							declarations.push(b.declarator(property.argument, b.call('$.rest_props', ...args)));
						}
					}
				}

				// TODO
				continue;
			}

			const args = /** @type {CallExpression} */ (init).arguments;
			const value = /** @type {Expression} */ (args[0]) ?? b.void0; // TODO do we need the void 0? can we just omit it altogether?

			if (rune === '$state' || rune === '$state.raw') {
				const state_declarators = [];
				const current_chunk = context.state.current_parallelized_chunk;
				const kind = node.kind;
				const parallelize =
					declarator.id.type === 'Identifier' &&
					context.state.analysis.instance?.scope === context.state.scope &&
					value.type === 'AwaitExpression' &&
					!is_expression_async(value.argument) &&
					kind !== 'using' && kind !== 'await using' &&
					can_be_parallelized(value.argument, context.state.scope, context.state.analysis, [
						...(current_chunk?.bindings ?? []),
						...bindings
					]);
				/**
				 * @param {Identifier} id
				 * @param {Expression} visited
				 * @param {Expression} value
				 */
				const create_state_declarator = (id, visited, value) => {
					const binding = /** @type {Binding} */ (context.state.scope.get(id.name));
					const is_state = is_state_source(binding, context.state.analysis);
					const is_proxy = should_proxy(visited, context.state.scope);
					const compose = [];
					if (parallelize) {
						if (rune === '$state' && is_proxy) {
							compose.push(b.id('$.proxy'));

							if (dev && !is_state) {
								compose.push(
									b.arrow([b.id('proxy')], b.call('$.tag_proxy', b.id('proxy'), b.literal(id.name)))
								);
							}
						}

						if (is_state) {
							compose.push(b.id('$.state'));
							if (dev) {
								compose.push(
									b.arrow([b.id('source')], b.call('$.tag', b.id('source'), b.literal(id.name)))
								);
							}
						}
						return b.call(
							'$.async_compose',
							/** @type {Expression} */ (
								context.visit(/** @type {AwaitExpression} */ (value).argument)
							),
							...compose
						);
					} else {
						let value = visited;
						if (rune === '$state' && is_proxy) {
							value = b.call('$.proxy', value);

							if (dev && !is_state) {
								value = b.call('$.tag_proxy', value, b.literal(id.name));
							}
						}

						if (is_state) {
							value = b.call('$.state', value);

							if (dev) {
								value = b.call('$.tag', value, b.literal(id.name));
							}
						}
						return value;
					}
				};

				if (declarator.id.type === 'Identifier') {
					const expression = /** @type {Expression} */ (context.visit(value));

					state_declarators.push(
						b.declarator(declarator.id, create_state_declarator(declarator.id, expression, value))
					);
				} else {
					const tmp = b.id(context.state.scope.generate('tmp'));
					const { inserts, paths } = extract_paths(declarator.id, tmp);

					state_declarators.push(
						b.declarator(tmp, /** @type {Expression} */ (context.visit(value))),
						...inserts.map(({ id, value }) => {
							id.name = context.state.scope.generate('$$array');
							context.state.transform[id.name] = { read: get_value };

							const expression = /** @type {Expression} */ (context.visit(b.thunk(value)));
							let call = b.call('$.derived', expression);

							if (dev) {
								const label = `[$state ${declarator.id.type === 'ArrayPattern' ? 'iterable' : 'object'}]`;
								call = b.call('$.tag', call, b.literal(label));
							}

							return b.declarator(id, call);
						}),
						...paths.map((path) => {
							const value = /** @type {Expression} */ (context.visit(path.expression));
							const binding = context.state.scope.get(/** @type {Identifier} */ (path.node).name);
							return b.declarator(
								path.node,
								binding?.kind === 'state' || binding?.kind === 'raw_state'
									? create_state_declarator(binding.node, value, path.expression)
									: value
							);
						})
					);
				}
				if (!parallelize) {
					declarations.push(...state_declarators);
				} else {
					const declarators = state_declarators.map(({ id, init }) => ({
						id,
						init: /** @type {Expression} */ (init)
					}));
					if (current_chunk && (current_chunk.kind === node.kind || current_chunk.kind === null)) {
						current_chunk.declarators.push(...declarators);
						current_chunk.bindings.push(...bindings);
						current_chunk.position = position;
						current_chunk.kind = kind;
					} else {
						/** @type {ParallelizedChunk} */
						const chunk = {
							kind,
							declarators,
							position,
							bindings
						};
						context.state.current_parallelized_chunk = chunk;
						context.state.parallelized_chunks.push(chunk);
					}
				}

				continue;
			}

			if (rune === '$derived' || rune === '$derived.by') {
				const is_async = context.state.analysis.async_deriveds.has(
					/** @type {CallExpression} */ (init)
				);
				let parallelize = false;
				const current_chunk = context.state.current_parallelized_chunk;
				if (
					is_async &&
					context.state.analysis.instance &&
					context.state.scope === context.state.analysis.instance.scope &&
					// TODO make it work without this
					declarator.id.type === 'Identifier' &&
					node.kind !== 'await using' && node.kind !== 'using'
				) {
					parallelize = can_be_parallelized(value, context.state.scope, context.state.analysis, [
						...(current_chunk?.bindings ?? []),
						...context.state.scope.get_bindings(declarator)
					]);
				}
				const kind = /** @type {ParallelizedChunk['kind']} */ (node.kind);

				/** @type {VariableDeclarator[]} */
				const derived_declarators = [];
				/** @type {Binding[]} */
				const bindings = [];

				if (declarator.id.type === 'Identifier') {
					let expression = /** @type {Expression} */ (context.visit(value));

					if (is_async) {
						const location = dev && !is_ignored(init, 'await_waterfall') && locate_node(init);
						let call = b.call(
							'$.async_derived',
							b.thunk(expression, true),
							location ? b.literal(location) : undefined
						);
						if (!parallelize) call = save(call);
						if (dev) {
							call = b.call(
								'$.tag' + (parallelize ? '_async' : ''),
								call,
								b.literal(declarator.id.name)
							);
						}
						bindings.push(/** @type {Binding} */ (context.state.scope.get(declarator.id.name)));
						derived_declarators.push(b.declarator(declarator.id, call));
					} else {
						if (rune === '$derived') expression = b.thunk(expression);

						let call = b.call('$.derived', expression);
						if (dev) call = b.call('$.tag', call, b.literal(declarator.id.name));
						derived_declarators.push(b.declarator(declarator.id, call));
					}
				} else {
					const init = /** @type {CallExpression} */ (declarator.init);
					let expression = /** @type {Expression} */ (context.visit(value));

					let rhs = value;

					if (rune !== '$derived' || init.arguments[0].type !== 'Identifier') {
						const id = b.id(context.state.scope.generate('$$d'));
						let call = b.call('$.derived', rune === '$derived' ? b.thunk(expression) : expression);

						rhs = b.call('$.get', id);

						if (is_async) {
							const location = dev && !is_ignored(init, 'await_waterfall') && locate_node(init);
							call = b.call(
								'$.async_derived',
								b.thunk(expression, true),
								location ? b.literal(location) : undefined
							);
							call = save(call);
						}

						if (dev) {
							const label = `[$derived ${declarator.id.type === 'ArrayPattern' ? 'iterable' : 'object'}]`;
							call = b.call('$.tag', call, b.literal(label));
						}
						derived_declarators.push(b.declarator(id, call));
					}

					const { inserts, paths } = extract_paths(declarator.id, rhs);

					for (const { id, value } of inserts) {
						id.name = context.state.scope.generate('$$array');
						context.state.transform[id.name] = { read: get_value };

						const expression = /** @type {Expression} */ (context.visit(b.thunk(value)));
						let call = b.call('$.derived', expression);

						if (dev) {
							const label = `[$derived ${declarator.id.type === 'ArrayPattern' ? 'iterable' : 'object'}]`;
							call = b.call('$.tag', call, b.literal(label));
						}
						derived_declarators.push(b.declarator(id, call));
					}

					for (const path of paths) {
						const expression = /** @type {Expression} */ (context.visit(path.expression));
						const call = b.call('$.derived', b.thunk(expression));
						derived_declarators.push(
							b.declarator(
								path.node,
								dev
									? b.call('$.tag', call, b.literal(/** @type {Identifier} */ (path.node).name))
									: call
							)
						);
					}
				}

				if (!parallelize) {
					declarations.push(...derived_declarators);
				} else if (derived_declarators.length > 0) {
					const declarators = derived_declarators.map(({ id, init }) => ({
						id,
						init: /** @type {Expression} */ (init)
					}));
					if (current_chunk && (current_chunk.kind === kind || current_chunk.kind === null)) {
						current_chunk.declarators.push(...declarators);
						current_chunk.bindings.push(...bindings);
						current_chunk.position = position;
						current_chunk.kind = kind;
					} else {
						/** @type {ParallelizedChunk} */
						const chunk = {
							kind,
							declarators,
							position,
							bindings
						};
						context.state.current_parallelized_chunk = chunk;
						context.state.parallelized_chunks.push(chunk);
					}
				}

				continue;
			}
		}
	} else {
		for (const declarator of node.declarations) {
			const bindings = context.state.scope.get_bindings(declarator);
			const has_state = bindings.some((binding) => binding.kind === 'state');
			const has_props = bindings.some((binding) => binding.kind === 'bindable_prop');

			if (!has_state && !has_props) {
				const init = declarator.init;

				if (init != null && is_hoisted_function(init)) {
					context.state.hoisted.push(
						b.const(declarator.id, /** @type {Expression} */ (context.visit(init)))
					);

					continue;
				}

				declarations.push(/** @type {VariableDeclarator} */ (context.visit(declarator)));
				continue;
			}

			if (has_props) {
				if (declarator.id.type !== 'Identifier') {
					// Turn export let into props. It's really really weird because export let { x: foo, z: [bar]} = ..
					// means that foo and bar are the props (i.e. the leafs are the prop names), not x and z.
					const tmp = b.id(context.state.scope.generate('tmp'));
					const { inserts, paths } = extract_paths(declarator.id, tmp);

					declarations.push(
						b.declarator(
							tmp,
							/** @type {Expression} */ (context.visit(/** @type {Expression} */ (declarator.init)))
						)
					);

					for (const { id, value } of inserts) {
						id.name = context.state.scope.generate('$$array');
						context.state.transform[id.name] = { read: get_value };

						const expression = /** @type {Expression} */ (context.visit(b.thunk(value)));
						declarations.push(b.declarator(id, b.call('$.derived', expression)));
					}

					for (const path of paths) {
						const name = /** @type {Identifier} */ (path.node).name;
						const binding = /** @type {Binding} */ (context.state.scope.get(name));
						const value = /** @type {Expression} */ (context.visit(path.expression));

						declarations.push(
							b.declarator(
								path.node,
								binding.kind === 'bindable_prop'
									? get_prop_source(binding, context.state, binding.prop_alias ?? name, value)
									: value
							)
						);
					}

					continue;
				}

				const binding = /** @type {Binding} */ (context.state.scope.get(declarator.id.name));

				declarations.push(
					b.declarator(
						declarator.id,
						get_prop_source(
							binding,
							context.state,
							binding.prop_alias ?? declarator.id.name,
							declarator.init && /** @type {Expression} */ (context.visit(declarator.init))
						)
					)
				);

				continue;
			}

			declarations.push(
				...create_state_declarators(
					declarator,
					context,
					/** @type {Expression} */ (declarator.init && context.visit(declarator.init))
				)
			);
		}
	}

	if (declarations.length === 0) {
		return b.empty;
	}

	return {
		...node,
		declarations
	};
}

/**
 * Creates the output for a state declaration in legacy mode.
 * @param {VariableDeclarator} declarator
 * @param {ComponentContext} context
 * @param {Expression} value
 */
function create_state_declarators(declarator, context, value) {
	const immutable = context.state.analysis.immutable ? b.true : undefined;
	if (declarator.id.type === 'Identifier') {
		return [b.declarator(declarator.id, b.call('$.mutable_source', value, immutable))];
	}

	const tmp = b.id(context.state.scope.generate('tmp'));
	const { inserts, paths } = extract_paths(declarator.id, tmp);

	return [
		b.declarator(tmp, value),
		...inserts.map(({ id, value }) => {
			id.name = context.state.scope.generate('$$array');
			context.state.transform[id.name] = { read: get_value };

			const expression = /** @type {Expression} */ (context.visit(b.thunk(value)));
			return b.declarator(id, b.call('$.derived', expression));
		}),
		...paths.map(({ expression, node }) => {
			const value = /** @type {Expression} */ (context.visit(expression));
			const binding = context.state.scope.get(/** @type {Identifier} */ (node).name);

			return b.declarator(
				node,
				binding?.kind === 'state' ? b.call('$.mutable_source', value, immutable) : value
			);
		})
	];
}
