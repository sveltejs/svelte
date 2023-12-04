import { regex_starts_with_whitespaces, regex_ends_with_whitespaces } from '../../patterns.js';

/** @param {string} str */
export function trim_start(str) {
	return str.replace(regex_starts_with_whitespaces, '');
}

/** @param {string} str */
export function trim_end(str) {
	return str.replace(regex_ends_with_whitespaces, '');
}
