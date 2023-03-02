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

const regex_html_characters_to_escape = /["'&<>]/g;

export function escape_html(html) {
	return String(html).replace(regex_html_characters_to_escape, match => escaped[match]);
}

const regex_template_characters_to_escape = /(\${|`|\\)/g;

export function escape_template(str) {
	return str.replace(regex_template_characters_to_escape, '\\$1');
}
