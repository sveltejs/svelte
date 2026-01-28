export * from '../shared/errors.js';

/**
 * MESSAGE
 * @param {string} PARAMETER
 * @returns {never}
 */
export function CODE(PARAMETER) {
	const error = new Error(`${'CODE'}\n${MESSAGE}\nhttps://svelte.dev/e/${'CODE'}`);
	error.name = 'Svelte error';
	throw error;
}
