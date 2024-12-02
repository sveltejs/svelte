import { CompileDiagnostic } from './utils/compile_diagnostic.js';

/** @typedef {{ start?: number, end?: number }} NodeLike */

class InternalCompileError extends Error {
	message = ''; // ensure this property is enumerable
	#diagnostic;

	/**
	 * @param {string} code
	 * @param {string} message
	 * @param {[number, number] | undefined} position
	 */
	constructor(code, message, position) {
		super(message);
		this.stack = ''; // avoid unnecessary noise; don't set it as a class property or it becomes enumerable

		// We want to extend from Error so that various bundler plugins properly handle it.
		// But we also want to share the same object shape with that of warnings, therefore
		// we create an instance of the shared class an copy over its properties.
		this.#diagnostic = new CompileDiagnostic(code, message, position);
		Object.assign(this, this.#diagnostic);
		this.name = 'CompileError';
	}

	toString() {
		return this.#diagnostic.toString();
	}

	toJSON() {
		return this.#diagnostic.toJSON();
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
