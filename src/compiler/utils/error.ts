import { locate } from 'locate-character';
import get_code_frame from './get_code_frame.js';

/**
 * @extends Error
 */
class CompileError extends Error {
	/**
	 * @type {string}
	 */
	code = undefined;

	/**
	 * @type {{ line: number; column: number }}
	 */
	start = undefined;

	/**
	 * @type {{ line: number; column: number }}
	 */
	end = undefined;

	/**
	 * @type {number}
	 */
	pos = undefined;

	/**
	 * @type {string}
	 */
	filename = undefined;

	/**
	 * @type {string}
	 */
	frame = undefined;

	toString() {
		return `${this.message} (${this.start.line}:${this.start.column})\n${this.frame}`;
	}
}

/**
 * @param {string} message
 * @param {{
 * 		name: string;
 * 		code: string;
 * 		source: string;
 * 		filename: string;
 * 		start: number;
 * 		end?: number;
 * 	}} props
 * @returns {never}
 */
export default function error(message, props) {
	const error = new CompileError(message);
	error.name = props.name;
	const start = locate(props.source, props.start, { offsetLine: 1 });
	const end = locate(props.source, props.end || props.start, { offsetLine: 1 });
	error.code = props.code;
	error.start = start;
	error.end = end;
	error.pos = props.start;
	error.filename = props.filename;
	error.frame = get_code_frame(props.source, start.line - 1, start.column);
	throw error;
}
