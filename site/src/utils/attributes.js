const ATTRS_REGEX = /^(.+)\s+\{(.+)\}$/;
/**
 * Extracts attributes from markdown text to be applied to the resulting HTML.
 * @example
 * // returns { 
 * //   text: 'Heading',
 * //   raw: '<code>Heading</code>',
 * //   attrs: { id: 'important', class: 'red', test: 'true' },
 * //   attrstring: 'id="important" class="red" test="true"'
 * // }
 * extract_attributes(
 *   'Heading { #important .red test=true }', 
 *   '<code>Heading</code> { #important .red test=true }'
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
			attrs,
			attrstring: Object.keys(attrs).map(key => `${key}="${attrs[key].trim()}"`).join(' ')
		}
	} catch (err) {
		console.log(err);
		return {
			text,
			raw,
			attrs: {},
			attrstring: ''
		};
	}
}

function parse_attributes(raw_attributes) {
	const attributes = raw_attributes.split(' ');
	const result = { };
	attributes.forEach(attr => {
		if (!attr) return;
		if (attr.startsWith('#')) {
			result.id = attr.substring(1);
		} else if (attr.startsWith('.')) {
			if (!result.class) {
				result.class = '';
			}
			result.class += attr.substring(1) + ' ';
		} else {
			let [key, value = ''] = attr.split('=');
			result[key] = value;
		}
	})

	return result;
}