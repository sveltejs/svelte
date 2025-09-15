/** @import { AST } from '#compiler' */
import * as b from '#compiler/builders';

/**
 * @param {any} transparent
 * @returns {AST.Fragment}
 */
export function create_fragment(transparent = false) {
	return {
		type: 'Fragment',
		nodes: [],
		metadata: {
			transparent,
			dynamic: false,
			has_await: false
		}
	};
}
