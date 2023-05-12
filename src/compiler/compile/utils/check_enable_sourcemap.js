/**
 * @param {import("../../interfaces.js").EnableSourcemap} enable_sourcemap
 * @param {keyof Exclude<import("../../interfaces.js").EnableSourcemap, boolean>} namespace
 */
export default function check_enable_sourcemap(enable_sourcemap, namespace) {
	return typeof enable_sourcemap === 'boolean' ? enable_sourcemap : enable_sourcemap[namespace];
}
