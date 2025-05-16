/** @import { CallExpression, ClassBody, Expression, Identifier, Literal, MethodDefinition, PrivateIdentifier, PropertyDefinition, StaticBlock } from 'estree' */
/** @import { Context, StateField } from '../types' */
import * as b from '#compiler/builders';
import { get_name } from '../../../nodes.js';
import { regex_invalid_identifier_chars } from '../../../patterns.js';
import { get_rune } from '../../../scope.js';
import { should_proxy } from '../utils.js';

/**
 * @param {ClassBody} node
 * @param {Context} context
 */
export function ClassBody(node, context) {
	const state_fields = context.state.analysis.classes.get(node);

	if (!state_fields) {
		// in legacy mode, do nothing
		context.next();
		return;
	}

	/** @type {string[]} */
	const private_ids = [];

	for (const prop of node.body) {
		if (
			(prop.type === 'MethodDefinition' || prop.type === 'PropertyDefinition') &&
			prop.key.type === 'PrivateIdentifier'
		) {
			private_ids.push(prop.key.name);
		}
	}

	const private_state = new Map();

	/**
	 * each `foo = $state()` needs a backing `#foo` field
	 * @type {Record<string, PrivateIdentifier>}
	 */
	const backing_fields = {};

	for (const name in state_fields) {
		if (name[0] === '#') {
			private_state.set(name.slice(1), state_fields[name]);
			continue;
		}

		let deconflicted = name.replace(regex_invalid_identifier_chars, '_');
		while (private_ids.includes(deconflicted)) {
			deconflicted = '_' + deconflicted;
		}

		private_ids.push(deconflicted);
		backing_fields[name] = b.private_id(deconflicted);
	}

	/** @type {Array<MethodDefinition | PropertyDefinition | StaticBlock>} */
	const body = [];

	const child_state = { ...context.state, state_fields, backing_fields, private_state }; // TODO populate private_state

	for (const name in state_fields) {
		if (name[0] === '#') {
			continue;
		}

		const field = state_fields[name];

		// insert backing fields for stuff declared in the constructor
		if (field.node.type === 'AssignmentExpression') {
			const backing = backing_fields[name];
			const member = b.member(b.this, backing);

			const should_proxy = field.type === '$state' && true; // TODO

			const key = b.key(name);

			body.push(
				b.prop_def(backing, null),

				b.method('get', key, [], [b.return(b.call('$.get', member))]),

				b.method(
					'set',
					key,
					[b.id('value')],
					[b.stmt(b.call('$.set', member, b.id('value'), should_proxy && b.true))]
				)
			);
		}
	}

	// Replace parts of the class body
	for (const definition of node.body) {
		if (definition.type === 'MethodDefinition' || definition.type === 'StaticBlock') {
			body.push(
				/** @type {MethodDefinition | StaticBlock} */ (context.visit(definition, child_state))
			);
			continue;
		}

		const name = get_name(definition.key);
		if (name === null || !Object.hasOwn(state_fields, name)) {
			body.push(/** @type {PropertyDefinition} */ (context.visit(definition, child_state)));
			continue;
		}

		const field = state_fields[name];

		if (name[0] === '#') {
			body.push(/** @type {PropertyDefinition} */ (context.visit(definition, child_state)));
		} else {
			if (field.node.type === 'AssignmentExpression') {
				continue;
			}

			const backing = backing_fields[name];
			const member = b.member(b.this, backing);

			const should_proxy = field.type === '$state' && true; // TODO

			body.push(
				b.prop_def(
					backing,
					/** @type {CallExpression} */ (
						context.visit(definition.value ?? field.value, child_state)
					)
				),

				b.method('get', definition.key, [], [b.return(b.call('$.get', member))]),

				b.method(
					'set',
					definition.key,
					[b.id('value')],
					[b.stmt(b.call('$.set', member, b.id('value'), should_proxy && b.true))]
				)
			);
		}

		// if (definition.type === 'PropertyDefinition') {
		// 	const original_name = get_name(definition.key);
		// 	if (original_name === null) continue;

		// 	const name = definition_names[original_name];

		// 	const is_private = definition.key.type === 'PrivateIdentifier';
		// 	const field = (is_private ? private_state : public_state).get(name);

		// 	if (definition.value?.type === 'CallExpression' && field !== undefined) {
		// 		let value = null;

		// 		if (definition.value.arguments.length > 0) {
		// 			const init = /** @type {Expression} **/ (
		// 				context.visit(definition.value.arguments[0], child_state)
		// 			);

		// 			value =
		// 				field.kind === 'state'
		// 					? b.call(
		// 							'$.state',
		// 							should_proxy(init, context.state.scope) ? b.call('$.proxy', init) : init
		// 						)
		// 					: field.kind === 'raw_state'
		// 						? b.call('$.state', init)
		// 						: field.kind === 'derived_by'
		// 							? b.call('$.derived', init)
		// 							: b.call('$.derived', b.thunk(init));
		// 		} else {
		// 			// if no arguments, we know it's state as `$derived()` is a compile error
		// 			value = b.call('$.state');
		// 		}

		// 		if (is_private) {
		// 			body.push(b.prop_def(field.id, value));
		// 		} else {
		// 			// #foo;
		// 			const member = b.member(b.this, field.id);
		// 			body.push(b.prop_def(field.id, value));

		// 			// get foo() { return this.#foo; }
		// 			body.push(b.method('get', definition.key, [], [b.return(b.call('$.get', member))]));

		// 			// set foo(value) { this.#foo = value; }
		// 			const val = b.id('value');

		// 			body.push(
		// 				b.method(
		// 					'set',
		// 					definition.key,
		// 					[val],
		// 					[b.stmt(b.call('$.set', member, val, field.kind === 'state' && b.true))]
		// 				)
		// 			);
		// 		}
		// 		continue;
		// 	}
		// }

		// body.push(/** @type {MethodDefinition} **/ (context.visit(definition, child_state)));
	}

	return { ...node, body };
}

/**
 * @param {string} name
 * @param {Map<string, StateField>} public_state
 */
function get_deconflicted_name(name, public_state) {
	name = name.replace(regex_invalid_identifier_chars, '_');

	// the above could generate conflicts because it has to generate a valid identifier
	// so stuff like `0` and `1` or `state%` and `state^` will result in the same string
	// so we have to de-conflict. We can only check `public_state` because private state
	// can't have literal keys
	while (name && public_state.has(name)) {
		name = '_' + name;
	}

	return name;
}
