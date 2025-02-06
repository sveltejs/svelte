/** @import { ClassBody } from 'estree' */
/** @import { Context } from '../types' */
import { get_rune } from '../../scope.js';

/**
 * @param {ClassBody} node
 * @param {Context} context
 */
export function ClassBody(node, context) {
	/** @type {string[]} */
	const derived_state = [];

	for (const definition of node.body) {
		if (
			definition.type === 'PropertyDefinition' &&
			(definition.key.type === 'PrivateIdentifier' || definition.key.type === 'Identifier') &&
			definition.value?.type === 'CallExpression'
		) {
			const rune = get_rune(definition.value, context.state.scope);
			if (rune === '$derived' || rune === '$derived.by') {
				derived_state.push(definition.key.name);
			}
		}
	}

	context.next({ ...context.state, derived_state });
}
