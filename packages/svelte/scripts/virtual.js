/**
 *
 * @param {Record<string, string>} modules
 * @returns {import('rolldown').Plugin}
 */
export function virtual(modules) {
	const resolved_ids = new Map(Object.entries(modules).map(([id, code]) => ['\0' + id, code]));

	return {
		name: 'virtual',
		resolveId(id) {
			if (id in modules) return '\0' + id;
		},
		load(id) {
			return resolved_ids.get(id) ?? null;
		}
	};
}
