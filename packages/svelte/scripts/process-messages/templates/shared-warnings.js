import { DEV } from 'esm-env';

var bold = 'font-weight: bold';
var normal = 'font-weight: normal';

/**
 * MESSAGE
 * @param {boolean} trace
 * @param {string} PARAMETER
 */
export function CODE(trace, PARAMETER) {
	if (DEV) {
		console.warn(`%c[svelte] ${'CODE'}\n%c${MESSAGE}`, bold, normal);
		if (trace) console.trace('stack trace');
	} else {
		// TODO print a link to the documentation
		console.warn('CODE');
	}
}
