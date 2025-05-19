/** @import { AssignmentExpression, CallExpression, ClassBody, PropertyDefinition, Expression, PrivateIdentifier, MethodDefinition } from 'estree' */
/** @import { StateField } from '#compiler' */
/** @import { Context } from '../types' */
import * as b from '#compiler/builders';
import { get_rune } from '../../scope.js';
import * as e from '../../../errors.js';
import { is_state_creation_rune } from '../../../../utils.js';
import { get_name } from '../../nodes.js';
import { regex_invalid_identifier_chars } from '../../patterns.js';

/**
 * @param {ClassBody} node
 * @param {Context} context
 */
export function ClassBody(node, context) {
	if (!context.state.analysis.runes) {
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

	/** @type {Map<string, StateField>} */
	const state_fields = new Map();

	context.state.analysis.classes.set(node, state_fields);

	/** @type {MethodDefinition | null} */
	let constructor = null;

	/**
	 * @param {PropertyDefinition | AssignmentExpression} node
	 * @param {Expression | PrivateIdentifier} key
	 * @param {Expression | null | undefined} value
	 */
	function handle(node, key, value) {
		const name = get_name(key);
		if (name === null) return;

		const rune = get_rune(value, context.state.scope);

		if (rune && is_state_creation_rune(rune)) {
			if (state_fields.has(name)) {
				e.state_field_duplicate(node, name);
			}

			state_fields.set(name, {
				node,
				type: rune,
				// @ts-expect-error for public state this is filled out in a moment
				key: key.type === 'PrivateIdentifier' ? key : null,
				value: /** @type {CallExpression} */ (value)
			});
		}
	}

	for (const child of node.body) {
		if (child.type === 'PropertyDefinition' && !child.computed && !child.static) {
			handle(child, child.key, child.value);
		}

		if (child.type === 'MethodDefinition' && child.kind === 'constructor') {
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

	for (const [name, field] of state_fields) {
		if (name[0] === '#') {
			continue;
		}

		let deconflicted = name.replace(regex_invalid_identifier_chars, '_');
		while (private_ids.includes(deconflicted)) {
			deconflicted = '_' + deconflicted;
		}

		private_ids.push(deconflicted);
		field.key = b.private_id(deconflicted);
	}

	context.next({ ...context.state, state_fields });
}
