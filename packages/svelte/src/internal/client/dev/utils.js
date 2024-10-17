/**
 * Append zero-width space to '/' characters to prevent devtools trying to make locations clickable
 * @param {string} location
 */
export function sanitize_location(location) {
	return location?.replace(/\//g, '/\u200b');
}
