/** @import { CallExpression, ClassBody, MethodDefinition, PrivateIdentifier, PropertyDefinition, StaticBlock } from 'estree' */
/** @import { Context } from '../types.js' */
import * as b from '#compiler/builders';
import { regex_invalid_identifier_chars } from '../../../patterns.js';
import { get_name } from '../../../nodes.js';

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

	/**
	 * each `foo = $state()` needs a backing `#foo` field
	 * @type {Record<string, PrivateIdentifier>}
	 */
	const backing_fields = {};

	for (const name in state_fields) {
		if (name[0] === '#') {
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

	const child_state = { ...context.state, state_fields, backing_fields };

	for (const name in state_fields) {
		if (name[0] === '#') {
			continue;
		}

		const field = state_fields[name];

		// insert backing fields for stuff declared in the constructor
		if (
			field.node.type === 'AssignmentExpression' &&
			(field.type === '$derived' || field.type === '$derived.by')
		) {
			const backing = backing_fields[name];
			const member = b.member(b.this, backing);

			const should_proxy = field.type === '$state' && true; // TODO

			const key = b.key(name);

			body.push(
				b.prop_def(backing, null),

				b.method('get', key, [], [b.return(b.call(member))])
			);
		}
	}

	// Replace parts of the class body
	for (const definition of node.body) {
		if (definition.type !== 'PropertyDefinition') {
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

		if (name[0] === '#' || field.type === '$state' || field.type === '$state.raw') {
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

				b.method('get', definition.key, [], [b.return(b.call(member))])
			);
		}
	}

	return { ...node, body };
}
