import { DEV } from 'esm-env';

var bold = 'font-weight: bold';
var normal = 'font-weight: normal';

/**
 * DESCRIPTION
 * @param {VALUES} values
 */
export function CODE(values) {
	if (DEV) {
		console.warn(
			`%c[svelte] ${'CODE'}\n%c${MESSAGE(values)}\nhttps://svelte.dev/e/${'CODE'}`,
			bold,
			normal
		);
	} else {
		console.warn(`https://svelte.dev/e/${'CODE'}`);
	}
}
