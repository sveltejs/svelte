export * from '../shared/errors.js';

/**
 * DESCRIPTION
 * @param {VALUES} values
 * @returns {never}
 */
export function CODE(values) {
	const error = new Error(`${'CODE'}\n${MESSAGE(values)}\nhttps://svelte.dev/e/${'CODE'}`);
	error.name = 'Svelte error';
	throw error;
}
