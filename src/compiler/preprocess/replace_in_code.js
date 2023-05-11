import { MappedCode } from '../utils/mapped_code.js';

/**
 * @param {string} code_slice
 * @param {number} offset
 * @param {import('./private.js').Source} opts
 * @returns {import('./private.js').Source}
 */
export function slice_source(code_slice, offset, { file_basename, filename, get_location }) {
	return {
		source: code_slice,
		get_location: (index) => get_location(index + offset),
		file_basename,
		filename
	};
}

/**
 * @param {RegExp} re
 * @param {(...match: any[]) => Promise<MappedCode>} get_replacement
 * @param {string} source
 */
function calculate_replacements(re, get_replacement, source) {
	/**
	 * @type {Array<Promise<import('./private.js').Replacement>>}
	 */
	const replacements = [];
	source.replace(re, (...match) => {
		replacements.push(
			get_replacement(...match).then((replacement) => {
				const matched_string = match[0];
				const offset = match[match.length - 2];
				return { offset, length: matched_string.length, replacement };
			})
		);
		return '';
	});
	return Promise.all(replacements);
}

/**
 * @param {import('./private.js').Replacement[]} replacements
 * @param {import('./private.js').Source} source
 * @returns {MappedCode}
 */
function perform_replacements(replacements, source) {
	const out = new MappedCode();
	let last_end = 0;
	for (const { offset, length, replacement } of replacements) {
		const unchanged_prefix = MappedCode.from_source(
			slice_source(source.source.slice(last_end, offset), last_end, source)
		);
		out.concat(unchanged_prefix).concat(replacement);
		last_end = offset + length;
	}
	const unchanged_suffix = MappedCode.from_source(
		slice_source(source.source.slice(last_end), last_end, source)
	);
	return out.concat(unchanged_suffix);
}

/**
 * @param {RegExp} regex
 * @param {(...match: any[]) => Promise<MappedCode>} get_replacement
 * @param {import('./private.js').Source} location
 * @returns {Promise<MappedCode>}
 */
export async function replace_in_code(regex, get_replacement, location) {
	const replacements = await calculate_replacements(regex, get_replacement, location.source);
	return perform_replacements(replacements, location);
}
