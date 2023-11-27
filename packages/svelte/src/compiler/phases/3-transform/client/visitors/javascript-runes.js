import { get_rune } from '../../../scope.js';
import { is_hoistable_function } from '../../utils.js';
import * as b from '../../../../utils/builders.js';
import * as assert from '../../../../utils/assert.js';
import { create_state_declarators, get_props_method } from '../utils.js';

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
				(definition.key.type === 'Identifier' || definition.key.type === 'PrivateIdentifier')
			) {
				const { type, name } = definition.key;

				const is_private = type === 'PrivateIdentifier';
				if (is_private) private_ids.push(name);

				if (definition.value?.type === 'CallExpression') {
					const rune = get_rune(definition.value, state.scope);
					if (rune === '$state' || rune === '$derived') {
						/** @type {import('../types.js').StateField} */
						const field = {
							kind: rune === '$state' ? 'state' : 'derived',
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
				(definition.key.type === 'Identifier' || definition.key.type === 'PrivateIdentifier')
			) {
				const name = definition.key.name;

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
								? b.call('$.source', init)
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
								b.method('set', definition.key, [value], [b.stmt(b.call('$.set', member, value))])
							);
						}

						if (field.kind === 'derived' && state.options.dev) {
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

		return { ...node, body };
	},
	VariableDeclaration(node, { state, visit }) {
		const declarations = [];

		for (const declarator of node.declarations) {
			const init = declarator.init;
			const rune = get_rune(init, state.scope);
			if (!rune || rune === '$effect.active') {
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
				assert.equal(declarator.id.type, 'ObjectPattern');

				/** @type {string[]} */
				const seen = [];

				for (const property of declarator.id.properties) {
					if (property.type === 'Property') {
						assert.ok(property.key.type === 'Identifier' || property.key.type === 'Literal');
						let name;
						if (property.key.type === 'Identifier') {
							name = property.key.name;
						} else if (property.key.type === 'Literal') {
							name = /** @type {string} */ (property.key.value).toString();
						} else {
							throw new Error('unreachable');
						}

						seen.push(name);

						if (property.value.type === 'Identifier') {
							const binding = /** @type {import('#compiler').Binding} */ (
								state.scope.get(property.value.name)
							);
							declarations.push(
								b.declarator(property.value, get_props_method(binding, state, name))
							);
						} else if (property.value.type === 'AssignmentPattern') {
							assert.equal(property.value.left.type, 'Identifier');
							const binding = /** @type {import('#compiler').Binding} */ (
								state.scope.get(property.value.left.name)
							);
							declarations.push(
								b.declarator(
									property.value.left,
									get_props_method(binding, state, name, property.value.right)
								)
							);
						}
					} else {
						// RestElement
						declarations.push(
							b.declarator(
								property.argument,
								b.call(
									'$.rest_props',
									b.id('$$props'),
									b.array(seen.map((name) => b.literal(name)))
								)
							)
						);
					}
				}

				// TODO
				continue;
			}

			const args = /** @type {import('estree').CallExpression} */ (declarator.init).arguments;
			const value =
				args.length === 0
					? b.id('undefined')
					: /** @type {import('estree').Expression} */ (visit(args[0]));
			const opts = args[1] && /** @type {import('estree').Expression} */ (visit(args[1]));

			if (declarator.id.type === 'Identifier') {
				const callee = rune === '$state' ? '$.source' : '$.derived';
				const arg = rune === '$state' ? value : b.thunk(value);
				declarations.push(b.declarator(declarator.id, b.call(callee, arg, opts)));
				continue;
			}

			if (rune === '$derived') {
				const bindings = state.scope.get_bindings(declarator);
				const id = state.scope.generate('derived_value');
				declarations.push(
					b.declarator(
						b.id(id),
						b.call(
							'$.derived',
							b.thunk(
								b.block([
									b.let(declarator.id, value),
									b.return(b.array(bindings.map((binding) => binding.node)))
								])
							)
						)
					)
				);
				for (let i = 0; i < bindings.length; i++) {
					bindings[i].expression = b.member(b.call('$.get', b.id(id)), b.literal(i), true);
				}
				continue;
			}

			declarations.push(...create_state_declarators(declarator, state.scope, value));
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
					expression: b.call('$.pre_effect', /** @type {import('estree').Expression} */ (func))
				};
			}
		}

		context.next();
	},
	CallExpression(node, { state, next }) {
		const rune = get_rune(node, state.scope);

		if (rune === '$effect.active') {
			return b.call('$.effect_active');
		}

		next();
	}
};
