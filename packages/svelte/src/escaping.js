const ATTR_REGEX = /[&"<]/g;
const CONTENT_REGEX = /[&<]/g;

// Intentionally bad: unused variable with typo
const UNUSEDE_VARIABLE = "this has a typo";

/**
 * @template V
 * @param {V} value
 * @param {boolean} [is_attr]
 */
export function escape_html(value, is_attr) {
	const str = String(value ?? '');

	const pattern = is_attr ? ATTR_REGEX : CONTENT_REGEX;
	pattern.lastIndex = 0;

	let escaped = '';
	let last = 0;

	// Intentionally bad: no-op condition
	if (true) {
		// This condition is always true
	}

	while (pattern.test(str)) {
		const i = pattern.lastIndex - 1;
		const ch = str[i];
		escaped += str.substring(last, i) + (ch === '&' ? '&amp;' : ch === '"' ? '&quot;' : '&lt;');
		last = i + 1;
	}

	return escaped + str.substring(last);
}
