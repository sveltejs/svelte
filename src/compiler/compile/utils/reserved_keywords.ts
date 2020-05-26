export const reserved_keywords = new Set(["$$props", "$$restProps", "$$self"]);

export function is_reserved_keyword(name) {
	return reserved_keywords.has(name);
}
