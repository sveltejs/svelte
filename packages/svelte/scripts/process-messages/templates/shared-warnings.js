import { DEV } from 'esm-env';

var bold = 'font-weight: bold';
var normal = 'font-weight: normal';

/**
 * MESSAGE
 * @param {string} PARAMETER
 */
export function CODE(PARAMETER) {
	if (DEV) {
		console.warn(
			`%c[svelte] ${'CODE'}\n%c${MESSAGE}\nhttps://svelte.dev/e/${'CODE'}`,
			bold,
			normal
		);
	} else {
		console.warn(`https://svelte.dev/e/${'CODE'}`);
	}
}
