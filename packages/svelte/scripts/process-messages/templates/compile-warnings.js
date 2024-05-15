import { filename, locator, warnings, ignore_stack } from './state.js';

/** @typedef {{ start?: number, end?: number }} NodeLike */

/**
 * @param {null | NodeLike} node
 * @param {string} code
 * @param {string} message
 */
function w(node, code, message) {
	if (ignore_stack.at(-1)?.has(code)) return;

	warnings.push({
		code,
		message,
		filename,
		start: node?.start !== undefined ? locator(node.start) : undefined,
		end: node?.end !== undefined ? locator(node.end) : undefined
	});
}

export const codes = CODES;

/**
 * MESSAGE
 * @param {null | NodeLike} node
 * @param {string} PARAMETER
 */
export function CODE(node, PARAMETER) {
	w(node, 'CODE', MESSAGE);
}
