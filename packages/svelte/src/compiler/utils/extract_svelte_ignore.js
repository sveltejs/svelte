import { regex_whitespace } from '../phases/patterns.js';

const regex_svelte_ignore = /^\s*svelte-ignore\s+([\s\S]+)\s*$/m;

/**
 * @param {string} text
 * @returns {string[]}
 */
export function extract_svelte_ignore(text) {
	const match = regex_svelte_ignore.exec(text);
	return match
		? match[1]
				.split(regex_whitespace)
				.map(/** @param {any} x */ (x) => x.trim())
				.filter(Boolean)
		: [];
}
