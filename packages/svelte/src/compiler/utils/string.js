/**
 * @param {string[]} strings
 * @param {string} conjunction
 */
export function list(strings, conjunction = 'or') {
	if (strings.length === 1) return strings[0];
	if (strings.length === 2) return `${strings[0]} ${conjunction} ${strings[1]}`;
	return `${strings.slice(0, -1).join(', ')} ${conjunction} ${strings[strings.length - 1]}`;
}
