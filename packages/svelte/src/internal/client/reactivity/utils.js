/**
 * @param {import('#client').Reaction} target_signal
 * @param {import('#client').Reaction} ref_signal
 * @returns {void}
 */
export function push_reference(target_signal, ref_signal) {
	const references = target_signal.r;
	if (references === null) {
		target_signal.r = [ref_signal];
	} else {
		references.push(ref_signal);
	}
}
