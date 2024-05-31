import { filename, locator, warnings, ignore_stack, ignore_map } from './state.js';

/** @typedef {{ start?: number, end?: number }} NodeLike */

/**
 * @param {null | NodeLike} node
 * @param {string} code
 * @param {string} message
 */
function w(node, code, message) {
	let stack = ignore_stack;
	if (node) {
		stack = ignore_map.get(node) ?? ignore_stack;
	}
	if (stack && stack.at(-1)?.has(code)) return;

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
