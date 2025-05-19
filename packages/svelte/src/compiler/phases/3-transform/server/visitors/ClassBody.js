/** @import { CallExpression, ClassBody, MethodDefinition, PropertyDefinition, StaticBlock } from 'estree' */
/** @import { Context } from '../types.js' */
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

	for (const [name, field] of state_fields) {
		if (name[0] === '#') {
			continue;
		}

		// insert backing fields for stuff declared in the constructor
		if (
			field &&
			field.node.type === 'AssignmentExpression' &&
			(field.type === '$derived' || field.type === '$derived.by')
		) {
			const member = b.member(b.this, field.key);

			body.push(
				b.prop_def(field.key, null),
				b.method('get', b.key(name), [], [b.return(b.call(member))])
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
		const field = name && state_fields.get(name);

		if (!field) {
			body.push(/** @type {PropertyDefinition} */ (context.visit(definition, child_state)));
			continue;
		}

		if (name[0] === '#' || field.type === '$state' || field.type === '$state.raw') {
			body.push(/** @type {PropertyDefinition} */ (context.visit(definition, child_state)));
		} else if (field.node === definition) {
			const member = b.member(b.this, field.key);

			body.push(
				b.prop_def(
					field.key,
					/** @type {CallExpression} */ (context.visit(field.value, child_state))
				),

				b.method('get', definition.key, [], [b.return(b.call(member))])
			);
		}
	}

	return { ...node, body };
}
