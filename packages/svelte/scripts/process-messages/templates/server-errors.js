/**
 * MESSAGE
 * @param {string} PARAMETER
 * @returns {never}
 */
export function CODE(PARAMETER) {
	const error = new Error(`${'CODE'}\n${MESSAGE}`);
	error.name = 'Svelte error';
	throw error;
}
