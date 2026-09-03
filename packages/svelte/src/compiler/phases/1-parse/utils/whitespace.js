/** @param {number} cc */
export function is_whitespace(cc) {
	// fast path for common whitespace
	if (cc === 32 || (cc <= 13 && cc >= 9)) return true;
	// rare whitespace — \u00a0, \u1680, \u2000-\u200a, \u2028, \u2029, \u202f, \u205f, \u3000, \ufeff
	if (cc < 160) return false;
	return (
		cc === 160 ||
		cc === 5760 ||
		(cc >= 8192 && cc <= 8202) ||
		cc === 8232 ||
		cc === 8233 ||
		cc === 8239 ||
		cc === 8287 ||
		cc === 12288 ||
		cc === 65279
	);
}
