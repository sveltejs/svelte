/** @import { Expression, Node, Pattern, Statement, UpdateExpression } from 'estree' */
/** @import { Context } from '../types' */
import { is_ignored } from '../../../../state.js';
import { object } from '../../../../utils/ast.js';
import * as b from '../../../../utils/builders.js';

/**
 * @param {UpdateExpression} node
 * @param {Context} context
 */
export function UpdateExpression(node, context) {
	const argument = node.argument;

	if (
		argument.type === 'MemberExpression' &&
		argument.object.type === 'ThisExpression' &&
		argument.property.type === 'PrivateIdentifier' &&
		context.state.private_state.has(argument.property.name)
	) {
		let fn = '$.update';
		if (node.prefix) fn += '_pre';

		/** @type {Expression[]} */
		const args = [argument];
		if (node.operator === '--') {
			args.push(b.literal(-1));
		}

		return b.call(fn, ...args);
	}

	if (argument.type !== 'Identifier' && argument.type !== 'MemberExpression') {
		throw new Error('An impossible state was reached');
	}

	const left = object(argument);
	if (left === null) return context.next();

	if (left === argument) {
		const transform = context.state.transform;
		const update = transform[left.name]?.update;

		if (update && Object.hasOwn(transform, left.name)) {
			return update(node);
		}
	}

	const assignment = /** @type {Expression} */ (
		context.visit(
			b.assignment(
				node.operator === '++' ? '+=' : '-=',
				/** @type {Pattern} */ (argument),
				b.literal(1)
			)
		)
	);

	const parent = /** @type {Node} */ (context.path.at(-1));
	const is_standalone = parent.type === 'ExpressionStatement'; // TODO and possibly others, but not e.g. the `test` of a WhileStatement

	const update =
		node.prefix || is_standalone
			? assignment
			: b.binary(node.operator === '++' ? '-' : '+', assignment, b.literal(1));

	return is_ignored(node, 'ownership_invalid_mutation')
		? b.call('$.skip_ownership_validation', b.thunk(update))
		: update;
}
