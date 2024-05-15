import fuzzymatch from '../phases/1-parse/utils/fuzzymatch.js';
import * as w from '../warnings.js';

const regex_svelte_ignore = /^\s*svelte-ignore\s/;

/** @type {Record<string, string>} Map of legacy code -> new code */
const replacements = {
	'non-top-level-reactive-declaration': 'reactive_declaration_invalid_placement',
	'module-script-reactive-declaration': 'reactive_declaration_module_script',
	'empty-block': 'block_empty',
	'avoid-is': 'attribute_avoid_is',
	'invalid-html-attribute': 'attribute_invalid_property_name',
	'a11y-structure': 'a11y_figcaption_parent',
	'illegal-attribute-character': 'attribute_illegal_colon',
	'invalid-rest-eachblock-binding': 'bind_invalid_each_rest'
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

	let length = match[0].length;
	offset += length;

	/** @type {string[]} */
	const ignores = [];

	// Warnings have to be separated by commas, everything after is interpreted as prose
	for (const match of text.slice(length).matchAll(/([\w$-]+)(,)?/gm)) {
		const code = match[1];

		ignores.push(code);

		if (!w.codes.includes(code)) {
			const replacement = replacements[code] ?? code.replace(/-/g, '_');

			if (runes) {
				// The type cast is for some reason necessary to pass the type check in CI
				const start = offset + /** @type {number} */ (match.index);
				const end = start + code.length;

				if (w.codes.includes(replacement)) {
					w.legacy_code({ start, end }, code, replacement);
				} else {
					const suggestion = fuzzymatch(code, w.codes);
					w.unknown_code({ start, end }, code, suggestion);
				}
			} else if (w.codes.includes(replacement)) {
				ignores.push(replacement);
			}
		}

		if (!match[2]) {
			break;
		}
	}

	return ignores;
}

/**
 * Replaces legacy svelte-ignore codes with new codes.
 * @param {string} text
 * @returns {string}
 */
export function migrate_svelte_ignore(text) {
	const match = regex_svelte_ignore.exec(text);
	if (!match) return text;

	const length = match[0].length;
	return (
		text.substring(0, length) +
		text
			.substring(length)
			.replace(/\w+-\w+(-\w+)*/g, (code) => replacements[code] ?? code.replace(/-/g, '_'))
	);
}
