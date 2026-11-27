import { DEV } from 'esm-env';
import { emit, hooks } from './dev/devtools.js';

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

		if (hooks.warningEmitted !== null) {
			emit('warningEmitted', 'CODE', [PARAMETER]);
		}
	} else {
		console.warn(`https://svelte.dev/e/${'CODE'}`);
	}
}
