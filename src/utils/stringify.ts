export function stringify(data: string) {
	return JSON.stringify(data.replace(/([^\\@#])?([@#])/g, '$1\\$2'));
}

export function escape(data: string) {
	return data.replace(/([^\\@#])?([@#])/g, '$1\\$2');
}
