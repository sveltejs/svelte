/**
 * @param {import("../../interfaces.js").EnableSourcemap} enable_sourcemap
 * @param {keyof Extract<import("../../interfaces.js").EnableSourcemap, object>} namespace
 */
export default function check_enable_sourcemap(enable_sourcemap, namespace) {
	return typeof enable_sourcemap === 'boolean' ? enable_sourcemap : enable_sourcemap[namespace];
}
