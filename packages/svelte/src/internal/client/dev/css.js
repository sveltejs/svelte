/** @type {Map<String, Set<HTMLStyleElement>} */
var styles_cleanup = new Map();

/**
 * @param {String} hash
 * @param {HTMLStyleElement} style
 */
export function register_css_cleanup(hash, style) {
	let hash_cleanup = styles_cleanup.get(hash);

	if (!hash_cleanup) {
		hash_cleanup = new Set();
		styles_cleanup.set(hash, hash_cleanup);
	}

	hash_cleanup.add(style);
}

/**
 * @param {String} hash
 */
export function cleanup_styles(hash) {
	const hash_cleanup = styles_cleanup.get(hash);

	if (hash_cleanup) {
		for (const style of hash_cleanup) {
			style.remove();
		}

		styles_cleanup.delete(hash);
	}
}
