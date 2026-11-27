/**
 * @param {string} label
 * @param {string} value
 */
export function load(label, value) {
	console.log(['opaque', `import ${label}`]);
	return Promise.resolve(value);
}

export function checkpoint() {
	console.log(['opaque', 'import checkpoint']);
}
