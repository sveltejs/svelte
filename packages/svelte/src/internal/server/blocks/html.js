import { DEV } from 'esm-env';
import { hash } from '../../../utils.js';
import { EMPTY_COMMENT, is_hydratable } from '../hydration.js';

/**
 * @param {string} value
 */
export function html(value) {
	const hydratable = is_hydratable();
	var html = String(value ?? '');
	var open = hydratable ? (DEV ? `<!--${hash(html)}-->` : EMPTY_COMMENT) : '';
	return open + html + (hydratable ? EMPTY_COMMENT : '');
}
