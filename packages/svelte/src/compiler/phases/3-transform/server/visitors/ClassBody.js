/** @import { CallExpression, ClassBody, Expression, MethodDefinition, PropertyDefinition, StaticBlock, VariableDeclaration } from 'estree' */
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
	const computed_field_declarations = /** @type {VariableDeclaration[]} */ (
		context.state.computed_field_declarations
	);

	for (const [name, field] of state_fields) {
		if (
			(typeof name === 'string' && name[0] === '#') ||
			field.node.type !== 'AssignmentExpression'
		) {
			continue;
		}

		if (typeof name !== 'string' && field.computed_key) {
			const key = context.state.scope.generate('key');
			computed_field_declarations.push(b.let(key));
			const member = b.member(b.this, field.key);
			body.push(
				b.prop_def(field.key, null),
				b.method(
					'get',
					b.assignment(
						'=',
						b.id(key),
						/** @type {Expression} */ (context.visit(field.computed_key))
					),
					[],
					[b.return(b.call(member))],
					true
				),
				b.method(
					'set',
					b.id(key),
					[b.id('$$value')],
					[b.return(b.call(member, b.id('$$value')))],
					true
				)
			);
			continue;
		}

		// insert backing fields for stuff declared in the constructor
		if (field.type === '$derived' || field.type === '$derived.by') {
			const member = b.member(b.this, field.key);

			body.push(
				b.prop_def(field.key, null),
				b.method('get', b.key(/** @type {string} */ (name)), [], [b.return(b.call(member))]),
				b.method(
					'set',
					b.key(/** @type {string} */ (name)),
					[b.id('$$value')],
					[b.return(b.call(member, b.id('$$value')))]
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

		const name = definition.computed
			? [...state_fields.entries()].find(([, field]) => field.node === definition)?.[0] ?? null
			: get_name(definition.key);
		const field = name !== null && state_fields.get(name);

		if (!field) {
			body.push(/** @type {PropertyDefinition} */ (context.visit(definition, child_state)));
			continue;
		}

		if (
			(typeof name === 'string' && name[0] === '#') ||
			field.type === '$state' ||
			field.type === '$state.raw'
		) {
			body.push(/** @type {PropertyDefinition} */ (context.visit(definition, child_state)));
		} else if (field.node === definition && typeof name === 'string') {
			// $derived / $derived.by
			const member = b.member(b.this, field.key);

			body.push(
				b.prop_def(
					field.key,
					/** @type {CallExpression} */ (context.visit(field.value, child_state))
				),

				b.method('get', definition.key, [], [b.return(b.call(member))]),
				b.method('set', b.key(name), [b.id('$$value')], [b.return(b.call(member, b.id('$$value')))])
			);
		} else if (field.computed_key) {
			// $derived / $derived.by
			const member = b.member(b.this, field.key);
			const key = context.state.scope.generate('key');
			computed_field_declarations.push(b.let(key));
			body.push(
				b.prop_def(
					field.key,
					/** @type {CallExpression} */ (context.visit(field.value, child_state))
				),
				b.method(
					'get',
					b.assignment(
						'=',
						b.id(key),
						/** @type {Expression} */ (context.visit(field.computed_key))
					),
					[],
					[b.return(b.call(member))],
					true
				),
				b.method(
					'set',
					b.id(key),
					[b.id('$$value')],
					[b.return(b.call(member, b.id('$$value')))],
					true
				)
			);
		}
	}

	return { ...node, body };
}
