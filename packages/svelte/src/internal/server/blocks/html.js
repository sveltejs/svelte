import { DEV } from 'esm-env';
import { hash } from '../dev.js';

/**
 * @param {string} value
 */
export function html(value) {
	var open = DEV ? `<!--${hash(value)}-->` : '<!---->';
	return `${open}${value}<!---->`;
}
