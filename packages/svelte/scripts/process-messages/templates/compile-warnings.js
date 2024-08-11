import { warnings, ignore_stack, ignore_map, warning_filter } from './state.js';
import { CompileDiagnostic } from './utils/compile_diagnostic.js';

/** @typedef {{ start?: number, end?: number }} NodeLike */

export class InternalCompileWarning extends CompileDiagnostic {
	name = 'CompileWarning';

	/**
	 * @param {string} code
	 * @param {string} message
	 * @param {[number, number] | undefined} position
	 */
	constructor(code, message, position) {
		super(code, message, position);
	}
}

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

	const warning = new InternalCompileWarning(
		code,
		message,
		node && node.start !== undefined ? [node.start, node.end ?? node.start] : undefined
	);

	if (!warning_filter(warning)) return;

	warnings.push(warning);
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
