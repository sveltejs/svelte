/**
 * @param {any} transparent
 * @returns {import('#compiler').Fragment}
 */
export function create_fragment(transparent = false) {
	return {
		type: 'Fragment',
		nodes: [],
		transparent
	};
}
