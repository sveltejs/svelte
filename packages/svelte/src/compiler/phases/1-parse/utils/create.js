/** @import { Fragment } from '#compiler' */
/**
 * @param {any} transparent
 * @returns {Fragment}
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
