export function stringify(data: string, options = {}) {
	return JSON.stringify(escape(data, options));
}

export function escape(data: string, { onlyEscapeAtSymbol = false } = {}) {
	return data.replace(onlyEscapeAtSymbol ? /@+/g : /(@+|#+)/g, (match: string) => {
		return match + match[0];
	});
}

const escaped = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
};

export function escapeHTML(html) {
	return String(html).replace(/[&<>]/g, match => escaped[match]);
}

export function escapeTemplate(str) {
	return str.replace(/(\${|`|\\)/g, '\\$1');
}
