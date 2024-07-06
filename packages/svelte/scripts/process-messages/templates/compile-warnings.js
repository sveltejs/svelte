import { filename, locator, warnings, ignore_stack, ignore_map, source } from './state.js';
import { get_code_frame } from './utils/get_code_frame.js';
import { error_to_string } from './utils/error_to_string.js';

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

	const start = node?.start !== undefined ? locator(node.start) : undefined;
	const frame = start && get_code_frame(source, start.line - 1, start.column);

	warnings.push({
		code,
		message,
		filename,
		position:
			node?.start !== undefined && node?.end !== undefined ? [node.start, node.end] : undefined,
		start,
		end: node?.end !== undefined ? locator(node.end) : undefined,
		frame,
		toString: () => error_to_string(code, message, filename, start, frame)
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
