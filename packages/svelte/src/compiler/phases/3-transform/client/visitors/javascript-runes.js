import { get_rune } from '../../../scope.js';
import { is_hoistable_function, transform_inspect_rune } from '../../utils.js';
import * as b from '../../../../utils/builders.js';
import * as assert from '../../../../utils/assert.js';
import {
	get_prop_source,
	is_prop_source,
	is_state_source,
	serialize_proxy_reassignment,
	should_proxy_or_freeze
} from '../utils.js';
import { extract_paths } from '../../../../utils/ast.js';
import { regex_invalid_identifier_chars } from '../../../patterns.js';

/** @type {import('../types.js').ComponentVisitors} */
export const javascript_visitors_runes = {
	ClassBody(node, { state, visit }) {
		/** @type {Map<string, import('../types.js').StateField>} */
		const public_state = new Map();

		/** @type {Map<string, import('../types.js').StateField>} */
		const private_state = new Map();

		/** @type {string[]} */
		const private_ids = [];

		for (const definition of node.body) {
			if (
				definition.type === 'PropertyDefinition' &&
				(definition.key.type === 'Identifier' ||
					definition.key.type === 'PrivateIdentifier' ||
					definition.key.type === 'Literal')
			) {
				const type = definition.key.type;
				const name = get_name(definition.key);
				if (!name) continue;

				const is_private = type === 'PrivateIdentifier';
				if (is_private) private_ids.push(name);

				if (definition.value?.type === 'CallExpression') {
					const rune = get_rune(definition.value, state.scope);
					if (
						rune === '$state' ||
						rune === '$state.frozen' ||
						rune === '$derived' ||
						rune === '$derived.by'
					) {
						/** @type {import('../types.js').StateField} */
						const field = {
							kind:
								rune === '$state'
									? 'state'
									: rune === '$state.frozen'
										? 'frozen_state'
										: rune === '$derived.by'
											? 'derived_call'
											: 'derived',
							// @ts-expect-error this is set in the next pass
							id: is_private ? definition.key : null
						};

						if (is_private) {
							private_state.set(name, field);
						} else {
							public_state.set(name, field);
						}
					}
				}
			}
		}

		// each `foo = $state()` needs a backing `#foo` field
		for (const [name, field] of public_state) {
			let deconflicted = name;
			while (private_ids.includes(deconflicted)) {
				deconflicted = '_' + deconflicted;
			}

			private_ids.push(deconflicted);
			field.id = b.private_id(deconflicted);
		}

		/** @type {Array<import('estree').MethodDefinition | import('estree').PropertyDefinition>} */
		const body = [];

		const child_state = { ...state, public_state, private_state };

		// Replace parts of the class body
		for (const definition of node.body) {
			if (
				definition.type === 'PropertyDefinition' &&
				(definition.key.type === 'Identifier' ||
					definition.key.type === 'PrivateIdentifier' ||
					definition.key.type === 'Literal')
			) {
				const name = get_name(definition.key);
				if (!name) continue;

				const is_private = definition.key.type === 'PrivateIdentifier';
				const field = (is_private ? private_state : public_state).get(name);

				if (definition.value?.type === 'CallExpression' && field !== undefined) {
					let value = null;

					if (definition.value.arguments.length > 0) {
						const init = /** @type {import('estree').Expression} **/ (
							visit(definition.value.arguments[0], child_state)
						);

						value =
							field.kind === 'state'
								? b.call(
										'$.source',
										should_proxy_or_freeze(init, state.scope) ? b.call('$.proxy', init) : init
									)
								: field.kind === 'frozen_state'
									? b.call(
											'$.source',
											should_proxy_or_freeze(init, state.scope) ? b.call('$.freeze', init) : init
										)
									: field.kind === 'derived_call'
										? b.call('$.derived', init)
										: b.call('$.derived', b.thunk(init));
					} else {
						// if no arguments, we know it's state as `$derived()` is a compile error
						value = b.call('$.source');
					}

					if (is_private) {
						body.push(b.prop_def(field.id, value));
					} else {
						// #foo;
						const member = b.member(b.this, field.id);
						body.push(b.prop_def(field.id, value));

						// get foo() { return this.#foo; }
						body.push(b.method('get', definition.key, [], [b.return(b.call('$.get', member))]));

						if (field.kind === 'state') {
							// set foo(value) { this.#foo = value; }
							const value = b.id('value');
							body.push(
								b.method(
									'set',
									definition.key,
									[value],
									[
										b.stmt(
											b.call('$.set', member, serialize_proxy_reassignment(value, field.id, state))
										)
									]
								)
							);
						}

						if (field.kind === 'frozen_state') {
							// set foo(value) { this.#foo = value; }
							const value = b.id('value');
							body.push(
								b.method(
									'set',
									definition.key,
									[value],
									[b.stmt(b.call('$.set', member, b.call('$.freeze', value)))]
								)
							);
						}

						if ((field.kind === 'derived' || field.kind === 'derived_call') && state.options.dev) {
							body.push(
								b.method(
									'set',
									definition.key,
									[b.id('_')],
									[b.throw_error(`Cannot update a derived property ('${name}')`)]
								)
							);
						}
					}
					continue;
				}
			}

			body.push(/** @type {import('estree').MethodDefinition} **/ (visit(definition, child_state)));
		}

		if (state.options.dev && public_state.size > 0) {
			// add an `[$.ADD_OWNER]` method so that a class with state fields can widen ownership
			body.push(
				b.method(
					'method',
					b.id('$.ADD_OWNER'),
					[b.id('owner')],
					Array.from(public_state.keys()).map((name) =>
						b.stmt(
							b.call(
								'$.add_owner',
								b.call('$.get', b.member(b.this, b.private_id(name))),
								b.id('owner')
							)
						)
					),
					true
				)
			);
		}

		return { ...node, body };
	},
	VariableDeclaration(node, { state, visit }) {
		const declarations = [];

		for (const declarator of node.declarations) {
			const init = declarator.init;
			const rune = get_rune(init, state.scope);
			if (
				!rune ||
				rune === '$effect.tracking' ||
				rune === '$effect.root' ||
				rune === '$inspect' ||
				rune === '$state.snapshot' ||
				rune === '$state.is'
			) {
				if (init != null && is_hoistable_function(init)) {
					const hoistable_function = visit(init);
					state.hoisted.push(
						b.declaration(
							'const',
							declarator.id,
							/** @type {import('estree').Expression} */ (hoistable_function)
						)
					);
					continue;
				}
				declarations.push(/** @type {import('estree').VariableDeclarator} */ (visit(declarator)));
				continue;
			}

			if (rune === '$props') {
				/** @type {string[]} */
				const seen = ['$$slots', '$$events', '$$legacy'];

				if (state.analysis.custom_element) {
					seen.push('$$host');
				}

				if (declarator.id.type === 'Identifier') {
					/** @type {import('estree').Expression[]} */
					const args = [b.id('$$props'), b.array(seen.map((name) => b.literal(name)))];

					if (state.options.dev) {
						// include rest name, so we can provide informative error messages
						args.push(b.literal(declarator.id.name));
					}

					declarations.push(b.declarator(declarator.id, b.call('$.rest_props', ...args)));
				} else {
					assert.equal(declarator.id.type, 'ObjectPattern');

					for (const property of declarator.id.properties) {
						if (property.type === 'Property') {
							const key = /** @type {import('estree').Identifier | import('estree').Literal} */ (
								property.key
							);
							const name = key.type === 'Identifier' ? key.name : /** @type {string} */ (key.value);

							seen.push(name);

							let id =
								property.value.type === 'AssignmentPattern' ? property.value.left : property.value;
							assert.equal(id.type, 'Identifier');
							const binding = /** @type {import('#compiler').Binding} */ (state.scope.get(id.name));
							let initial =
								binding.initial &&
								/** @type {import('estree').Expression} */ (visit(binding.initial));
							// We're adding proxy here on demand and not within the prop runtime function so that
							// people not using proxied state anywhere in their code don't have to pay the additional bundle size cost
							if (initial && binding.mutated && should_proxy_or_freeze(initial, state.scope)) {
								initial = b.call('$.proxy', initial);
							}

							if (is_prop_source(binding, state)) {
								declarations.push(b.declarator(id, get_prop_source(binding, state, name, initial)));
							}
						} else {
							// RestElement
							/** @type {import('estree').Expression[]} */
							const args = [b.id('$$props'), b.array(seen.map((name) => b.literal(name)))];

							if (state.options.dev) {
								// include rest name, so we can provide informative error messages
								args.push(
									b.literal(/** @type {import('estree').Identifier} */ (property.argument).name)
								);
							}

							declarations.push(b.declarator(property.argument, b.call('$.rest_props', ...args)));
						}
					}
				}

				// TODO
				continue;
			}

			const args = /** @type {import('estree').CallExpression} */ (init).arguments;
			const value =
				args.length === 0
					? b.id('undefined')
					: /** @type {import('estree').Expression} */ (visit(args[0]));

			if (rune === '$state' || rune === '$state.frozen') {
				/**
				 * @param {import('estree').Identifier} id
				 * @param {import('estree').Expression} value
				 */
				const create_state_declarator = (id, value) => {
					const binding = /** @type {import('#compiler').Binding} */ (state.scope.get(id.name));
					if (should_proxy_or_freeze(value, state.scope)) {
						value = b.call(rune === '$state' ? '$.proxy' : '$.freeze', value);
					}
					if (is_state_source(binding, state)) {
						value = b.call('$.source', value);
					}
					return value;
				};

				if (declarator.id.type === 'Identifier') {
					declarations.push(
						b.declarator(declarator.id, create_state_declarator(declarator.id, value))
					);
				} else {
					const tmp = state.scope.generate('tmp');
					const paths = extract_paths(declarator.id);
					declarations.push(
						b.declarator(b.id(tmp), value),
						...paths.map((path) => {
							const value = path.expression?.(b.id(tmp));
							const binding = state.scope.get(
								/** @type {import('estree').Identifier} */ (path.node).name
							);
							return b.declarator(
								path.node,
								binding?.kind === 'state' || binding?.kind === 'frozen_state'
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
					const bindings = state.scope.get_bindings(declarator);
					const object_id = state.scope.generate('derived_object');
					const values_id = state.scope.generate('derived_values');
					declarations.push(
						b.declarator(
							b.id(object_id),
							b.call('$.derived', rune === '$derived.by' ? value : b.thunk(value))
						)
					);
					declarations.push(
						b.declarator(
							b.id(values_id),
							b.call(
								'$.derived',
								b.thunk(
									b.block([
										b.let(declarator.id, b.call('$.get', b.id(object_id))),
										b.return(b.array(bindings.map((binding) => binding.node)))
									])
								)
							)
						)
					);
					for (let i = 0; i < bindings.length; i++) {
						const binding = bindings[i];
						declarations.push(
							b.declarator(
								binding.node,
								b.call(
									'$.derived',
									b.thunk(b.member(b.call('$.get', b.id(values_id)), b.literal(i), true))
								)
							)
						);
					}
				}
				continue;
			}
		}

		if (declarations.length === 0) {
			return b.empty;
		}

		return {
			...node,
			declarations
		};
	},
	ExpressionStatement(node, context) {
		if (node.expression.type === 'CallExpression') {
			const callee = node.expression.callee;

			if (
				callee.type === 'Identifier' &&
				callee.name === '$effect' &&
				!context.state.scope.get('$effect')
			) {
				const func = context.visit(node.expression.arguments[0]);
				return {
					...node,
					expression: b.call('$.user_effect', /** @type {import('estree').Expression} */ (func))
				};
			}

			if (
				callee.type === 'MemberExpression' &&
				callee.object.type === 'Identifier' &&
				callee.object.name === '$effect' &&
				callee.property.type === 'Identifier' &&
				callee.property.name === 'pre' &&
				!context.state.scope.get('$effect')
			) {
				const func = context.visit(node.expression.arguments[0]);
				return {
					...node,
					expression: b.call('$.user_pre_effect', /** @type {import('estree').Expression} */ (func))
				};
			}
		}

		context.next();
	},
	CallExpression(node, context) {
		const rune = get_rune(node, context.state.scope);

		if (rune === '$host') {
			return b.id('$$props.$$host');
		}

		if (rune === '$effect.tracking') {
			return b.call('$.effect_tracking');
		}

		if (rune === '$state.snapshot') {
			return b.call(
				'$.snapshot',
				/** @type {import('estree').Expression} */ (context.visit(node.arguments[0]))
			);
		}

		if (rune === '$state.is') {
			return b.call(
				'$.is',
				/** @type {import('estree').Expression} */ (context.visit(node.arguments[0])),
				/** @type {import('estree').Expression} */ (context.visit(node.arguments[1]))
			);
		}

		if (rune === '$effect.root') {
			const args = /** @type {import('estree').Expression[]} */ (
				node.arguments.map((arg) => context.visit(arg))
			);
			return b.call('$.effect_root', ...args);
		}

		if (rune === '$inspect' || rune === '$inspect().with') {
			return transform_inspect_rune(node, context);
		}

		context.next();
	},
	BinaryExpression(node, { state, visit, next }) {
		const operator = node.operator;

		if (state.options.dev) {
			if (operator === '===' || operator === '!==') {
				return b.call(
					'$.strict_equals',
					/** @type {import('estree').Expression} */ (visit(node.left)),
					/** @type {import('estree').Expression} */ (visit(node.right)),
					operator === '!==' && b.literal(false)
				);
			}

			if (operator === '==' || operator === '!=') {
				return b.call(
					'$.equals',
					/** @type {import('estree').Expression} */ (visit(node.left)),
					/** @type {import('estree').Expression} */ (visit(node.right)),
					operator === '!=' && b.literal(false)
				);
			}
		}

		next();
	}
};

/**
 * @param {import('estree').Identifier | import('estree').PrivateIdentifier | import('estree').Literal} node
 */
function get_name(node) {
	if (node.type === 'Literal') {
		return node.value?.toString().replace(regex_invalid_identifier_chars, '_');
	} else {
		return node.name;
	}
}
