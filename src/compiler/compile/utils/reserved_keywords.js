export const reserved_keywords = new Set(['$$props', '$$restProps', '$$slots']);

/** @param {string} name */
export function is_reserved_keyword(name) {
	return reserved_keywords.has(name);
}
