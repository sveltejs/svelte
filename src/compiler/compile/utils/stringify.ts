export function stringify(data: string, options = {}) {
	return JSON.stringify(escape(data, options));
}

export function escape(data: string, { only_escape_at_symbol = false } = {}) {
	return data.replace(only_escape_at_symbol ? /@+/g : /(@+|#+)/g, (match: string) => {
		return match + match[0];
	});
}

const escaped = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
};

export function escape_html(html) {
	return String(html).replace(/[&<>]/g, match => escaped[match]);
}

export function escape_template(str) {
	return str.replace(/(\${|`|\\)/g, '\\$1');
}
