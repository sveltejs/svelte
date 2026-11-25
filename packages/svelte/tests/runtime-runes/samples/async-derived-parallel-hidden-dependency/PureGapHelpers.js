/**
 * @param {string} label
 * @param {number} value
 */
export function load(label, value) {
	console.log(['pure-gaps', `load ${label}`]);
	return Promise.resolve(value);
}

export function checkpoint() {
	console.log(['pure-gaps', 'checkpoint']);
}
