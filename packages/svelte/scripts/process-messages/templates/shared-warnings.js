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
			`%c[svelte] ${'CODE'}\n%c${MESSAGE}\nSee https://svelte.dev/e/${'CODE'} for more info`,
			bold,
			normal
		);
	} else {
		// TODO print a link to the documentation
		console.warn(`${'CODE'} (https://svelte.dev/e/${'CODE'})`);
	}
}
