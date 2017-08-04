export function stringify(data: string) {
	return JSON.stringify(escape(data));
}

export function escape(data: string) {
	return data.replace(/([^\\@#])?([@#])/g, '$1\\$2');
}
