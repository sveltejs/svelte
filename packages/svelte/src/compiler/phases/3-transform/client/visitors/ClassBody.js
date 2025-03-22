/** @import { ClassBody, Expression, Identifier, Literal, MethodDefinition, PrivateIdentifier, PropertyDefinition } from 'estree' */
/** @import {  } from '#compiler' */
/** @import { Context, StateField } from '../types' */
import { dev, is_ignored } from '../../../../state.js';
import * as b from '../../../../utils/builders.js';
import { regex_invalid_identifier_chars } from '../../../patterns.js';
import { get_rune } from '../../../scope.js';
import { should_proxy } from '../utils.js';

/**
 * @param {ClassBody} node
 * @param {Context} context
 */
export function ClassBody(node, context) {
	if (!context.state.analysis.runes) {
		context.next();
		return;
	}

	/** @type {Map<string, StateField>} */
	const public_state = new Map();

	/** @type {Map<string, StateField>} */
	const private_state = new Map();

	/** @type {Map<(MethodDefinition|PropertyDefinition)["key"], string>} */
	const definition_names = new Map();

	/** @type {string[]} */
	const private_ids = [];

	for (const definition of node.body) {
		if (
			(definition.type === 'PropertyDefinition' || definition.type === 'MethodDefinition') &&
			(definition.key.type === 'Identifier' ||
				definition.key.type === 'PrivateIdentifier' ||
				definition.key.type === 'Literal')
		) {
			const type = definition.key.type;
			const name = get_name(definition.key, public_state);
			if (!name) continue;

			// we store the deconflicted name in the map so that we can access it later
			definition_names.set(definition.key, name);

			const is_private = type === 'PrivateIdentifier';
			if (is_private) private_ids.push(name);

			if (definition.value?.type === 'CallExpression') {
				const rune = get_rune(definition.value, context.state.scope);
				if (
					rune === '$state' ||
					rune === '$state.raw' ||
					rune === '$derived' ||
					rune === '$derived.by'
				) {
					/** @type {StateField} */
					const field = {
						kind:
							rune === '$state'
								? 'state'
								: rune === '$state.raw'
									? 'raw_state'
									: rune === '$derived.by'
										? 'derived_by'
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

	/** @type {Array<MethodDefinition | PropertyDefinition>} */
	const body = [];

	const child_state = { ...context.state, public_state, private_state };

	// Replace parts of the class body
	for (const definition of node.body) {
		if (
			definition.type === 'PropertyDefinition' &&
			(definition.key.type === 'Identifier' ||
				definition.key.type === 'PrivateIdentifier' ||
				definition.key.type === 'Literal')
		) {
			const name = definition_names.get(definition.key);
			if (!name) continue;

			const is_private = definition.key.type === 'PrivateIdentifier';
			const field = (is_private ? private_state : public_state).get(name);

			if (definition.value?.type === 'CallExpression' && field !== undefined) {
				let value = null;

				if (definition.value.arguments.length > 0) {
					const init = /** @type {Expression} **/ (
						context.visit(definition.value.arguments[0], child_state)
					);

					value =
						field.kind === 'state'
							? b.call(
									'$.state',
									should_proxy(init, context.state.scope) ? b.call('$.proxy', init) : init
								)
							: field.kind === 'raw_state'
								? b.call('$.state', init)
								: field.kind === 'derived_by'
									? b.call('$.derived', init)
									: b.call('$.derived', b.thunk(init));
				} else {
					// if no arguments, we know it's state as `$derived()` is a compile error
					value = b.call('$.state');
				}

				if (is_private) {
					body.push(b.prop_def(field.id, value));
				} else {
					// #foo;
					const member = b.member(b.this, field.id);
					body.push(b.prop_def(field.id, value));

					// get foo() { return this.#foo; }
					body.push(b.method('get', definition.key, [], [b.return(b.call('$.get', member))]));

					if (field.kind === 'state' || field.kind === 'raw_state') {
						// set foo(value) { this.#foo = value; }
						const value = b.id('value');

						body.push(
							b.method(
								'set',
								definition.key,
								[value],
								[b.stmt(b.call('$.set', member, value, field.kind === 'state' && b.true))]
							)
						);
					}

					if (dev && (field.kind === 'derived' || field.kind === 'derived_by')) {
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

		body.push(/** @type {MethodDefinition} **/ (context.visit(definition, child_state)));
	}

	if (dev && public_state.size > 0) {
		// add an `[$.ADD_OWNER]` method so that a class with state fields can widen ownership
		body.push(
			b.method(
				'method',
				b.id('$.ADD_OWNER'),
				[b.id('owner')],
				[
					b.stmt(
						b.call(
							'$.add_owner_to_class',
							b.this,
							b.id('owner'),
							b.array(
								Array.from(public_state).map(([name]) =>
									b.thunk(b.call('$.get', b.member(b.this, b.private_id(name))))
								)
							),
							is_ignored(node, 'ownership_invalid_binding') && b.true
						)
					)
				],
				true
			)
		);
	}

	return { ...node, body };
}

/**
 * @param {Identifier | PrivateIdentifier | Literal} node
 * @param {Map<string, StateField>} public_state
 */
function get_name(node, public_state) {
	if (node.type === 'Literal') {
		let name = node.value?.toString().replace(regex_invalid_identifier_chars, '_');

		// the above could generate conflicts because it has to generate a valid identifier
		// so stuff like `0` and `1` or `state%` and `state^` will result in the same string
		// so we have to de-conflict. We can only check `public_state` because private state
		// can't have literal keys
		while (name && public_state.has(name)) {
			name = '_' + name;
		}
		return name;
	} else {
		return node.name;
	}
}
