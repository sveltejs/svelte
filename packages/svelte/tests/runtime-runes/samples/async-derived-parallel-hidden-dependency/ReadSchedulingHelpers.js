/**
 * @template T
 * @param {string} group
 * @param {string} name
 * @param {T} value
 */
export function load(group, name, value) {
	console.log([group, `load ${name}`]);
	return Promise.resolve(value);
}

/**
 * @template T
 * @param {string} group
 * @param {string} name
 * @param {T} value
 */
export function loadWithCompletion(group, name, value) {
	return load(group, name, value).then((result) => {
		console.log([group, `resolve ${name}`]);
		return result;
	});
}

/** @param {string} group */
export function checkpoint(group) {
	console.log([group, 'checkpoint']);
}

export const api = { load };

export const registry = {
	/** @type {(() => unknown) | null} */
	callback: null,

	/** @param {() => unknown} callback */
	register(callback) {
		this.callback = callback;
	},

	run() {
		return Promise.resolve(this.callback?.());
	}
};
