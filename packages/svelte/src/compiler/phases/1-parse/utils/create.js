/** @import { AST } from '#compiler' */

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
			has_await: false,
			// name is added later, after we've done scope analysis
			hoisted_promises: { name: '', promises: [] }
		}
	};
}
