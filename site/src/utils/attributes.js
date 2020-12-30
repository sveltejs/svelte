const ATTRS_REGEX = /^(.+)\s+\{(.+)\}$/;
/**
 * Extracts attributes from Markdown text.
 * @example
 * // returns { 
 * //   text: 'Heading',
 * //   raw: '<code>Heading</code>',
 * //   attrs: { test: 'true' }
 * // }
 * extract_attributes(
 *   'Heading { test=true }', 
 *   '<code>Heading</code> { test=true }'
 * );
 * ```
 * @param {string} text 
 * @param {string} raw 
 */
export function extract_attributes(text, raw) {
	try {
		const textMatch = text.match(ATTRS_REGEX);
		const rawMatch = raw && raw.match(ATTRS_REGEX);
		const attrs = textMatch ? parse_attributes(textMatch[2]) : {};

		return {
			text: textMatch ? textMatch[1] : text,
			raw: rawMatch ? rawMatch[1] : raw,
			attrs
		}
	} catch (err) {
		console.log(err);
		return {
			text,
			raw,
			attrs: {}
		};
	}
}

function parse_attributes(raw_attributes) {
	const attributes = raw_attributes.split(' ');
	const result = { };
	attributes.forEach(attr => {
		if (!attr) return;
		let [key, value = ''] = attr.split('=');
		result[key] = value;
	});

	return result;
}
