import { getLocator } from 'locate-character';

/** @typedef {{ start?: number, end?: number }} NodeLike */

// TODO no need to export these, it's temporary
/** @type {import('#compiler').Warning[]} */
export let warnings = [];
/** @type {string | undefined} */
export let filename;
export let locator = getLocator('', { offsetLine: 1 });

/**
 * @param {{
 *   source: string;
 *   filename: string | undefined;
 * }} options
 * @returns {import('#compiler').Warning[]}
 */
export function reset_warnings(options) {
	filename = options.filename;
	locator = getLocator(options.source, { offsetLine: 1 });

	return (warnings = []);
}

/**
 *
 * @param {null | NodeLike} node
 * @param {string} code
 * @param {string} message
 */
function w(node, code, message) {
	// @ts-expect-error
	if (node.ignores?.has(code)) return;

	warnings.push({
		code,
		message,
		filename,
		start: node?.start !== undefined ? locator(node.start) : undefined,
		end: node?.end !== undefined ? locator(node.end) : undefined
	});
}

/**
 * @param {null | NodeLike} node
 * @param {string} PARAMETER
 */
export function CODE(node, PARAMETER) {
	w(node, 'CODE', MESSAGE);
}
