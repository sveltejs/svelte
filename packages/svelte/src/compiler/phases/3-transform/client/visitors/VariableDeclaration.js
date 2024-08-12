/** @import { CallExpression, Expression, Identifier, Literal, VariableDeclaration, VariableDeclarator } from 'estree' */
/** @import { Binding } from '#compiler' */
/** @import { ComponentContext } from '../types' */
/** @import { Scope } from '../../../scope' */
import { dev } from '../../../../state.js';
import { extract_paths } from '../../../../utils/ast.js';
import * as b from '../../../../utils/builders.js';
import * as assert from '../../../../utils/assert.js';
import { get_rune } from '../../../scope.js';
import { get_prop_source, is_prop_source, is_state_source, should_proxy } from '../utils.js';
import { is_hoisted_function } from '../../utils.js';

/**
 * @param {VariableDeclaration} node
 * @param {ComponentContext} context
 */
export function VariableDeclaration(node, context) {
	/** @type {VariableDeclarator[]} */
	const declarations = [];

	if (context.state.analysis.runes) {
		for (const declarator of node.declarations) {
			const init = declarator.init;
			const rune = get_rune(init, context.state.scope);

			if (
				!rune ||
				rune === '$effect.tracking' ||
				rune === '$effect.root' ||
				rune === '$inspect' ||
				rune === '$state.snapshot' ||
				rune === '$state.is'
			) {
				if (init != null && is_hoisted_function(init)) {
					context.state.hoisted.push(
						b.declaration('const', declarator.id, /** @type {Expression} */ (context.visit(init)))
					);

					continue;
				}
				declarations.push(/** @type {VariableDeclarator} */ (context.visit(declarator)));
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
			const value =
				args.length === 0 ? b.id('undefined') : /** @type {Expression} */ (context.visit(args[0]));

			if (rune === '$state' || rune === '$state.raw') {
				/**
				 * @param {Identifier} id
				 * @param {Expression} value
				 */
				const create_state_declarator = (id, value) => {
					const binding = /** @type {import('#compiler').Binding} */ (
						context.state.scope.get(id.name)
					);
					if (rune === '$state' && should_proxy(value, context.state.scope)) {
						value = b.call('$.proxy', value);
					}
					if (is_state_source(binding, context.state)) {
						value = b.call('$.source', value);
					}
					return value;
				};

				if (declarator.id.type === 'Identifier') {
					declarations.push(
						b.declarator(declarator.id, create_state_declarator(declarator.id, value))
					);
				} else {
					const tmp = context.state.scope.generate('tmp');
					const paths = extract_paths(declarator.id);
					declarations.push(
						b.declarator(b.id(tmp), value),
						...paths.map((path) => {
							const value = path.expression?.(b.id(tmp));
							const binding = context.state.scope.get(/** @type {Identifier} */ (path.node).name);
							return b.declarator(
								path.node,
								binding?.kind === 'state' || binding?.kind === 'raw_state'
									? create_state_declarator(binding.node, value)
									: value
							);
						})
					);
				}

				continue;
			}

			if (rune === '$derived' || rune === '$derived.by') {
				if (declarator.id.type === 'Identifier') {
					declarations.push(
						b.declarator(
							declarator.id,
							b.call('$.derived', rune === '$derived.by' ? value : b.thunk(value))
						)
					);
				} else {
					const bindings = extract_paths(declarator.id);

					const init = /** @type {CallExpression} */ (declarator.init);

					/** @type {Identifier} */
					let id;
					let rhs = value;

					if (init.arguments[0].type === 'Identifier') {
						id = init.arguments[0];
					} else {
						id = b.id(context.state.scope.generate('$$d'));
						rhs = b.call('$.get', id);

						declarations.push(
							b.declarator(id, b.call('$.derived', rune === '$derived.by' ? value : b.thunk(value)))
						);
					}

					for (let i = 0; i < bindings.length; i++) {
						const binding = bindings[i];
						declarations.push(
							b.declarator(binding.node, b.call('$.derived', b.thunk(binding.expression(rhs))))
						);
					}
				}
				continue;
			}
		}
	} else {
		for (const declarator of node.declarations) {
			const bindings = /** @type {Binding[]} */ (context.state.scope.get_bindings(declarator));
			const has_state = bindings.some((binding) => binding.kind === 'state');
			const has_props = bindings.some((binding) => binding.kind === 'bindable_prop');

			if (!has_state && !has_props) {
				const init = declarator.init;

				if (init != null && is_hoisted_function(init)) {
					context.state.hoisted.push(
						b.declaration('const', declarator.id, /** @type {Expression} */ (context.visit(init)))
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
					const tmp = context.state.scope.generate('tmp');
					const paths = extract_paths(declarator.id);

					declarations.push(
						b.declarator(
							b.id(tmp),
							/** @type {Expression} */ (context.visit(/** @type {Expression} */ (declarator.init)))
						)
					);

					for (const path of paths) {
						const name = /** @type {Identifier} */ (path.node).name;
						const binding = /** @type {Binding} */ (context.state.scope.get(name));
						const value = path.expression?.(b.id(tmp));
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
					context.state.scope,
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
 * Creates the output for a state declaration.
 * @param {VariableDeclarator} declarator
 * @param {Scope} scope
 * @param {Expression} value
 */
function create_state_declarators(declarator, scope, value) {
	if (declarator.id.type === 'Identifier') {
		return [b.declarator(declarator.id, b.call('$.mutable_source', value))];
	}

	const tmp = scope.generate('tmp');
	const paths = extract_paths(declarator.id);
	return [
		b.declarator(b.id(tmp), value),
		...paths.map((path) => {
			const value = path.expression?.(b.id(tmp));
			const binding = scope.get(/** @type {Identifier} */ (path.node).name);
			return b.declarator(
				path.node,
				binding?.kind === 'state' ? b.call('$.mutable_source', value) : value
			);
		})
	];
}
