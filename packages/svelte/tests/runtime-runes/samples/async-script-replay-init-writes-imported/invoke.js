/** @template T @param {() => T} callback @returns {T} */
export function invoke(callback) {
	return callback();
}
