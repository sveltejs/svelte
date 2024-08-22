/** @import { Ast } from '#compiler' */

/**
 * @param {any} transparent
 * @returns {Ast.Fragment}
 */
export function create_fragment(transparent = false) {
	return {
		type: 'Fragment',
		nodes: [],
		metadata: {
			transparent,
			dynamic: false
		}
	};
}
