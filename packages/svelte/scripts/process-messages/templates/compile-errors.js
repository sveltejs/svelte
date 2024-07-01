/** @import { Location } from 'locate-character' */
import * as state from './state.js';

/** @typedef {{ start?: number, end?: number }} NodeLike */

export class InternalCompileError extends Error {
	name = 'CompileError';

	filename = state.filename;

	/** @type {[number, number] | undefined} */
	position = undefined;

	/** @type {Location | undefined} */
	start = undefined;

	/** @type {Location | undefined} */
	end = undefined;

	/**
	 *
	 * @param {string} code
	 * @param {string} message
	 * @param {[number, number] | undefined} position
	 */
	constructor(code, message, position) {
		super(message);

		this.code = code;
		this.position = position;

		if (position) {
			this.start = state.locator(position[0]);
			this.end = state.locator(position[1]);
		}
	}

	toString() {
		let out = `${this.name}: ${this.message}`;

		out += `\n(${this.code})`;

		if (this.filename) {
			out += `\n${this.filename}`;

			if (this.start) {
				out += `${this.start.line}:${this.start.column}`;
			}
		}

		return out;
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
		start !== undefined && end !== undefined ? [start, end] : undefined
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
