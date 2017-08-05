export function stringify(data: string, options = {}) {
	return JSON.stringify(escape(data, options));
}

export function escape(data: string, { onlyEscapeAtSymbol = false } = {}) {
	return data.replace(onlyEscapeAtSymbol ? /(@+)/g : /(@+|#+)/g, (match: string) => {
		return match + match[0];
	});
}
