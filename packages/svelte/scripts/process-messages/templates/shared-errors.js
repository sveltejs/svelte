import { DEV } from 'esm-env';

/**
 * MESSAGE
 * @param {string} PARAMETER
 * @returns {never}
 */
export function CODE(PARAMETER) {
	if (DEV) {
		const error = new Error(
			`${'CODE'}\n${MESSAGE}\nSee https://svelte.dev/e/${'CODE'} for more info`
		);
		error.name = 'Svelte error';
		throw error;
	} else {
		// TODO print a link to the documentation
		throw new Error(`${'CODE'} (https://svelte.dev/e/${'CODE'})`);
	}
}
