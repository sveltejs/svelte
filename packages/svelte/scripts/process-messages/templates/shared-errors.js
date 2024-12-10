import { DEV } from 'esm-env';

/**
 * MESSAGE
 * @param {string} PARAMETER
 * @returns {never}
 */
export function CODE(PARAMETER) {
	if (DEV) {
		const error = new Error(`${'CODE'}\n${MESSAGE}\nhttps://svelte.dev/e/${'CODE'}`);
		error.name = 'Svelte error';
		throw error;
	} else {
		throw new Error(`https://svelte.dev/e/${'CODE'}`);
	}
}
