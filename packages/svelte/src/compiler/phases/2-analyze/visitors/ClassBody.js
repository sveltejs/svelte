/** @import { AssignmentExpression, ClassBody, PropertyDefinition, Expression, PrivateIdentifier, MethodDefinition } from 'estree' */
/** @import { StateField } from '#compiler' */
/** @import { Context } from '../types' */
import { get_rune } from '../../scope.js';
import * as e from '../../../errors.js';
import { is_state_creation_rune } from '../../../../utils.js';

/**
 * @param {ClassBody} node
 * @param {Context} context
 */
export function ClassBody(node, context) {
	if (!context.state.analysis.runes) {
		context.next();
		return;
	}

	/** @type {Record<string, StateField>} */
	const state_fields = {};

	/** @type {string[]} */
	const seen = [];

	/** @type {MethodDefinition | null} */
	let constructor = null;

	/**
	 * @param {PropertyDefinition | AssignmentExpression} node
	 * @param {Expression | PrivateIdentifier} key
	 * @param {Expression | null | undefined} value
	 */
	function handle(node, key, value) {
		const name = get_name(key);
		if (!name) return;

		const rune = get_rune(value, context.state.scope);

		if (rune && is_state_creation_rune(rune)) {
			if (seen.includes(name)) {
				e.constructor_state_reassignment(node); // TODO the same thing applies to duplicate fields, so the code/message needs to change
			}

			state_fields[name] = {
				node,
				type: rune
			};
		}

		if (value) {
			seen.push(name);
		}
	}

	for (const child of node.body) {
		if (child.type === 'PropertyDefinition' && !child.computed) {
			handle(child, child.key, child.value);
		}

		if (
			child.type === 'MethodDefinition' &&
			child.key.type === 'Identifier' &&
			child.key.name === 'constructor'
		) {
			constructor = child;
		}
	}

	if (constructor) {
		for (const statement of constructor.value.body.body) {
			if (statement.type !== 'ExpressionStatement') continue;
			if (statement.expression.type !== 'AssignmentExpression') continue;

			const { left, right } = statement.expression;

			if (left.type !== 'MemberExpression') continue;
			if (left.object.type !== 'ThisExpression') continue;
			if (left.computed && left.property.type !== 'Literal') continue;

			handle(statement.expression, left.property, right);
		}
	}

	context.next({
		...context.state,
		state_fields
	});
}

/** @param {Expression | PrivateIdentifier} node */
function get_name(node) {
	if (node.type === 'Literal') return String(node.value);
	if (node.type === 'PrivateIdentifier') return '#' + node.name;
	if (node.type === 'Identifier') return node.name;

	return null;
}
