const BOM_CHARACTER = String.fromCharCode(65279);

/**
 * @param {string} str
 * @returns {string}
 */
export function sanitize_template_string(str) {
	return str
		.replace(/(`|\${|\\)/g, '\\$1')
		.replaceAll(BOM_CHARACTER, '')
		.replaceAll('&#xFEFF;', '');
}
