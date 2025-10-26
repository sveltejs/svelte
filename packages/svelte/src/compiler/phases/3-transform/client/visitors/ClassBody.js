/** @import { CallExpression, ClassBody, ClassDeclaration, ClassExpression, Expression, MethodDefinition, PropertyDefinition, StaticBlock, VariableDeclaration } from 'estree' */
/** @import { StateField } from '#compiler' */
/** @import { Context } from '../types' */
import * as b from '#compiler/builders';
import { dev } from '../../../../state.js';
import { get_parent } from '../../../../utils/ast.js';
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

	// insert backing fields for stuff declared in the constructor
	for (const [name, field] of state_fields) {
		if (
			(typeof name === 'string' && name[0] === '#') ||
			field.node.type !== 'AssignmentExpression'
		) {
			continue;
		}
		const member = b.member(b.this, field.key);
		const should_proxy = field.type === '$state' && true; // TODO

		if (typeof name === 'number' && field.computed_key) {
			const computed_key = /** @type {Expression} */ (context.visit(field.computed_key));
			const evaluation = context.state.scope.evaluate(computed_key);
			if (evaluation.is_known) {
				body.push(
					b.prop_def(field.key, null),
					b.method(
						'get',
						b.literal(evaluation.value),
						[],
						[b.return(b.call('$.get', member))],
						true
					),
					b.method(
						'set',
						b.literal(evaluation.value),
						[b.id('value')],
						[b.stmt(b.call('$.set', member, b.id('value'), should_proxy && b.true))],
						true
					)
				);
				continue;
			}
			const key = context.state.scope.generate('key');
			computed_field_declarations.push(b.let(key));

			body.push(
				b.prop_def(field.key, null),
				b.method(
					'get',
					b.assignment('=', b.id(key), computed_key),
					[],
					[b.return(b.call('$.get', member))],
					true
				),
				b.method(
					'set',
					b.id(key),
					[b.id('value')],
					[b.stmt(b.call('$.set', member, b.id('value'), should_proxy && b.true))],
					true
				)
			);
			continue;
		}
		const key = b.key(/** @type {string} */ (name));

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

	const declaration = /** @type {ClassDeclaration | ClassExpression} */ (
		get_parent(context.path, -1)
	);

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
		const field = name !== null && /** @type {StateField} */ (state_fields.get(name));

		if (!field) {
			body.push(/** @type {PropertyDefinition} */ (context.visit(definition, child_state)));
			continue;
		}
		const member = b.member(b.this, field.key);

		const should_proxy = field.type === '$state' && true; // TODO

		if (typeof name === 'string' && name[0] === '#') {
			let value = definition.value
				? /** @type {CallExpression} */ (context.visit(definition.value, child_state))
				: undefined;

			if (dev && field.node === definition) {
				value = b.call('$.tag', value, b.literal(`${declaration.id?.name ?? '[class]'}.${name}`));
			}

			body.push(b.prop_def(definition.key, value));
		} else if (field.node === definition && typeof name === 'string') {
			let call = /** @type {CallExpression} */ (context.visit(field.value, child_state));

			if (dev) {
				call = b.call('$.tag', call, b.literal(`${declaration.id?.name ?? '[class]'}.${name}`));
			}

			body.push(
				b.prop_def(field.key, call),

				b.method('get', definition.key, [], [b.return(b.call('$.get', member))]),

				b.method(
					'set',
					definition.key,
					[b.id('value')],
					[b.stmt(b.call('$.set', member, b.id('value'), should_proxy && b.true))]
				)
			);
		} else if (field.computed_key) {
			let call = /** @type {CallExpression} */ (context.visit(field.value, child_state));
			if (dev) {
				call = b.call(
					'$.tag',
					call,
					b.literal(`${declaration.id?.name ?? '[class]'}[computed key]`)
				);
			}
			const key = context.state.scope.generate('key');
			computed_field_declarations.push(b.let(key));

			body.push(
				b.prop_def(field.key, call),
				b.method(
					'get',
					b.assignment(
						'=',
						b.id(key),
						/** @type {Expression} */ (context.visit(field.computed_key))
					),
					[],
					[b.return(b.call('$.get', member))],
					true
				),
				b.method(
					'set',
					b.id(key),
					[b.id('value')],
					[b.stmt(b.call('$.set', member, b.id('value'), should_proxy && b.true))],
					true
				)
			);
		}
	}

	return { ...node, body };
}
