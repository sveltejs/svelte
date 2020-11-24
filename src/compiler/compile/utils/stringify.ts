export function string_literal(data: string) {
	return {
		type: 'Literal',
		value: data
	};
}

export function escape(data: string, { only_escape_at_symbol = false } = {}) {
	return data.replace(only_escape_at_symbol ? /@+/g : /(@+|#+)/g, (match: string) => {
		return match + match[0];
	});
}

const escaped = {
	'"': '&quot;',
	"'": '&#39;',
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;'
};

export function escape_html(html) {
	return String(html).replace(/["'&<>]/g, match => escaped[match]);
}

export function escape_template(str) {
	return str.replace(/(\${|`|\\)/g, '\\$1');
}
