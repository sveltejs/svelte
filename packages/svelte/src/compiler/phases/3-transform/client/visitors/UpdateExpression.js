/** @import { AssignmentExpression, Expression, UpdateExpression } from 'estree' */
/** @import { Context } from '../types' */
import { object } from '../../../../utils/ast.js';
import * as b from '#compiler/builders';
import { validate_mutation } from './shared/utils.js';

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
		context.state.state_fields.has('#' + argument.property.name)
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
	const transformers = left && context.state.transform[left.name];

	if (left === argument && transformers?.update) {
		// we don't need to worry about ownership_invalid_mutation here, because
		// we're not mutating but reassigning
		return transformers.update(node);
	}

	let update = /** @type {Expression} */ (context.next());

	if (left && transformers?.mutate) {
		update = transformers.mutate(
			left,
			/** @type {AssignmentExpression | UpdateExpression} */ (update)
		);
	}

	return validate_mutation(node, context, update);
}
