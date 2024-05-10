import * as w from '../warnings.js';

const regex_svelte_ignore = /^\s*svelte-ignore\s/;

/** @type {Record<string, string>} */
const replacements = {
	'non-top-level-reactive-declaration': 'reactive_declaration_invalid_placement'
};

/**
 * @param {number} offset
 * @param {string} text
 * @param {boolean} runes
 * @returns {string[]}
 */
export function extract_svelte_ignore(offset, text, runes) {
	const match = regex_svelte_ignore.exec(text);
	if (!match) return [];

	let start = match[0].length;
	offset += start;

	/** @type {string[]} */
	const ignores = [];

	for (const match of text.slice(start).matchAll(/\S+/gm)) {
		const code = match[0];

		console.log({ code, runes, codes: w.codes });

		if (runes && !w.codes.includes(code)) {
			const suggestion = replacements[code] || code.replace(/-/g, '_');

			if (w.codes.includes(suggestion)) {
				w.unknown_code({ start: offset, end: offset + code.length }, code, suggestion);
			} else {
				w.unknown_code({ start: offset, end: offset + code.length }, code);
			}
		}

		ignores.push(code);
	}

	return ignores;
}
