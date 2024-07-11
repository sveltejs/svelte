import { DEV } from 'esm-env';
import { hash } from '../../../utils.js';

/**
 * @param {string} value
 */
export function html(value) {
	var open = DEV ? `<!--${hash(String(value ?? ''))}-->` : '<!---->';
	return `${open}${value}<!---->`;
}
