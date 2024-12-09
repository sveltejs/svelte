/**
 * MESSAGE
 * @param {string} PARAMETER
 * @returns {never}
 */
export function CODE(PARAMETER) {
	const error = new Error(
		`${'CODE'}\n${MESSAGE}\nSee https://svelte.dev/e/${'CODE'} for more info`
	);
	error.name = 'Svelte error';
	throw error;
}
