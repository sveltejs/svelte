/** @import { CallExpression, ClassBody, MethodDefinition, PropertyDefinition, StaticBlock } from 'estree' */
/** @import { Context } from '../types' */
import * as b from '#compiler/builders';
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

	/** @type {Array<MethodDefinition | PropertyDefinition | StaticBlock>} */
	const body = [];

	const child_state = { ...context.state, state_fields };

	for (const name in state_fields) {
		if (name[0] === '#') {
			continue;
		}

		const field = state_fields[name];

		// insert backing fields for stuff declared in the constructor
		if (field.node.type === 'AssignmentExpression') {
			const member = b.member(b.this, field.key);

			const should_proxy = field.type === '$state' && true; // TODO

			const key = b.key(name);

			body.push(
				b.prop_def(field.key, null),

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

		if (name[0] === '#') {
			body.push(/** @type {PropertyDefinition} */ (context.visit(definition, child_state)));
		} else if (field.node === definition) {
			const member = b.member(b.this, field.key);

			const should_proxy = field.type === '$state' && true; // TODO

			body.push(
				b.prop_def(
					field.key,
					/** @type {CallExpression} */ (context.visit(field.value, child_state))
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
	}

	return { ...node, body };
}
