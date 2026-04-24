/**
 * @param {string} haystack
 * @param {string} needle
 * @param {number} start
 */
export function find_end(haystack, needle, start) {
	const i = haystack.indexOf(needle, start);

	if (i === -1) {
		e.unexpected_eof(haystack.length);
	}

	return i + needle.length;
}
