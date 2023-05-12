/**
 * @param {Let[]} lets
 * @returns {import("C:/repos/svelte/svelte/node_modules/.pnpm/@types+estree@1.0.0/node_modules/@types/estree/index").ObjectPattern}
 */
export function get_slot_scope(lets) {
	if (lets.length === 0) return null;
	return {
		type: 'ObjectPattern',
		properties: lets.map((l) => {
			return {
				type: 'Property',
				kind: 'init',
				method: false,
				shorthand: false,
				computed: false,
				key: l.name,
				value: l.value || l.name
			};
		})
	};
}
