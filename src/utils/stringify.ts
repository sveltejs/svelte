export function stringify(data: string) {
	return JSON.stringify(escape(data));
}

export function escape(data: string) {
	return data.replace(/(@+|#+)/g, (match: string) => {
		return match + match[0];
	});
}
