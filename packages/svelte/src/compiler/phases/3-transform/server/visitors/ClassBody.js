/** @import { ClassBody, Expression, MethodDefinition, PropertyDefinition } from 'estree' */
/** @import { Context } from '../types.js' */
/** @import { StateField } from '../../client/types.js' */
import { dev } from '../../../../state.js';
import * as b from '#compiler/builders';
import { get_rune } from '../../../scope.js';

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
	const public_derived = new Map();

	/** @type {Map<string, StateField>} */
	const private_derived = new Map();

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
				const rune = get_rune(definition.value, context.state.scope);
				if (rune === '$derived' || rune === '$derived.by') {
					/** @type {StateField} */
					const field = {
						kind: rune === '$derived.by' ? 'derived_by' : 'derived',
						// @ts-expect-error this is set in the next pass
						id: is_private ? definition.key : null
					};

					if (is_private) {
						private_derived.set(name, field);
					} else {
						public_derived.set(name, field);
					}
				}
			}
		}
	}

	// each `foo = $derived()` needs a backing `#foo` field
	for (const [name, field] of public_derived) {
		let deconflicted = name;
		while (private_ids.includes(deconflicted)) {
			deconflicted = '_' + deconflicted;
		}

		private_ids.push(deconflicted);
		field.id = b.private_id(deconflicted);
	}

	/** @type {Array<MethodDefinition | PropertyDefinition>} */
	const body = [];

	const child_state = { ...context.state, private_derived };

	// Replace parts of the class body
	for (const definition of node.body) {
		if (
			definition.type === 'PropertyDefinition' &&
			(definition.key.type === 'Identifier' || definition.key.type === 'PrivateIdentifier')
		) {
			const name = definition.key.name;

			const is_private = definition.key.type === 'PrivateIdentifier';
			const field = (is_private ? private_derived : public_derived).get(name);

			if (definition.value?.type === 'CallExpression' && field !== undefined) {
				const init = /** @type {Expression} **/ (
					context.visit(definition.value.arguments[0], child_state)
				);
				const value =
					field.kind === 'derived_by' ? b.call('$.once', init) : b.call('$.once', b.thunk(init));

				if (is_private) {
					body.push(b.prop_def(field.id, value));
				} else {
					// #foo;
					const member = b.member(b.this, field.id);
					body.push(b.prop_def(field.id, value));

					// get foo() { return this.#foo; }
					body.push(b.method('get', definition.key, [], [b.return(b.call(member))]));

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

	return { ...node, body };
}
