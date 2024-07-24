/** @import { Expression, Identifier } from 'estree' */
/** @import { ServerTransformState } from '../../../types' */
import * as b from '../../../../../../utils/builders.js';

/**
 * @param {Identifier} node
 * @param {ServerTransformState} state
 * @returns {Expression}
 */
export function serialize_get_binding(node, state) {
	const binding = state.scope.get(node.name);

	if (binding === null || node === binding.node) {
		// No associated binding or the declaration itself which shouldn't be transformed
		return node;
	}

	if (binding.kind === 'store_sub') {
		const store_id = b.id(node.name.slice(1));
		return b.call(
			'$.store_get',
			b.assignment('??=', b.id('$$store_subs'), b.object([])),
			b.literal(node.name),
			serialize_get_binding(store_id, state)
		);
	}

	if (Object.hasOwn(state.getters, node.name)) {
		const getter = state.getters[node.name];
		return typeof getter === 'function' ? getter(node) : getter;
	}

	return node;
}
