const regex_return_characters = /\r/g;

/**
 * @param {string} str
 * @returns {string}
 */
export function hash(str) {
	str = str.replace(regex_return_characters, '');
	let hash = 5381;
	let i = str.length;

	while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
	return (hash >>> 0).toString(36);
}
