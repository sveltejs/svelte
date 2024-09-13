/** @type {Map<String, Set<() => void>>} */
var styles_cleanup = new Map();

/**
 * @param {String} hash
 * @param {() => void} cleanup
 */
export function register_css_cleanup(hash, cleanup) {
	let hash_cleanup = styles_cleanup.get(hash);
	if (!hash_cleanup) {
		hash_cleanup = new Set();
		styles_cleanup.set(hash, hash_cleanup);
	}

	hash_cleanup.add(cleanup);
}

/**
 * @param {String} hash
 */
export function cleanup_styles(hash) {
	const hash_cleanup = styles_cleanup.get(hash);
	if (hash_cleanup) {
		for (const cleanup of hash_cleanup) {
			cleanup();
		}

		styles_cleanup.delete(hash);
	}
}
