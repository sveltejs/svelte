import { CompileDiagnostic } from './utils/compile_diagnostic.js';

/** @typedef {{ start?: number, end?: number }} NodeLike */

class InternalCompileError extends CompileDiagnostic {
	name = 'CompileError';

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
 * @param {null | number | NodeLike} node
 * @param {string} code
 * @param {string} message
 * @returns {never}
 */
function e(node, code, message) {
	const start = typeof node === 'number' ? node : node?.start;
	const end = typeof node === 'number' ? node : node?.end;

	throw new InternalCompileError(
		code,
		message,
		start !== undefined ? [start, end ?? start] : undefined
	);
}

/**
 * MESSAGE
 * @param {null | number | NodeLike} node
 * @param {string} PARAMETER
 * @returns {never}
 */
export function CODE(node, PARAMETER) {
	e(node, 'CODE', MESSAGE);
}
