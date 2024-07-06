/** @import { Location } from 'locate-character' */
import * as state from '../state.js';

const regex_tabs = /^\t+/;

/**
 * @param {string} str
 */
function tabs_to_spaces(str) {
	return str.replace(regex_tabs, (match) => match.split('\t').join('  '));
}

/**
 * @param {string} source
 * @param {number} line
 * @param {number} column
 */
function get_code_frame(source, line, column) {
	const lines = source.split('\n');
	const frame_start = Math.max(0, line - 2);
	const frame_end = Math.min(line + 3, lines.length);
	const digits = String(frame_end + 1).length;
	return lines
		.slice(frame_start, frame_end)
		.map((str, i) => {
			const is_error_line = frame_start + i === line;
			const line_num = String(i + frame_start + 1).padStart(digits, ' ');
			if (is_error_line) {
				const indicator =
					' '.repeat(digits + 2 + tabs_to_spaces(str.slice(0, column)).length) + '^';
				return `${line_num}: ${tabs_to_spaces(str)}\n${indicator}`;
			}
			return `${line_num}: ${tabs_to_spaces(str)}`;
		})
		.join('\n');
}

/**
 * @typedef {{
 * 	code: string;
 * 	message: string;
 * 	filename?: string;
 * 	start?: Location;
 * 	end?: Location;
 * 	position?: [number, number];
 * 	frame?: string;
 * }} ICompileDiagnostic */

/** @implements {ICompileDiagnostic} */
export class CompileDiagnostic extends Error {
	name = 'CompileDiagnostic';

	/**
	 * @param {string} code
	 * @param {string} message
	 * @param {[number, number] | undefined} position
	 */
	constructor(code, message, position) {
		super(message);
		this.code = code;

		if (state.filename) {
			this.filename = state.filename;
		}

		if (position) {
			this.position = position;
			this.start = state.locator(position[0]);
			this.end = state.locator(position[1]);
			if (this.start && this.end) {
				this.frame = get_code_frame(state.source, this.start.line - 1, this.end.column);
			}
		}
	}

	toString() {
		let out = `${this.code}: ${this.message}`;

		if (this.filename) {
			out += `\n${this.filename}`;

			if (this.start) {
				out += `:${this.start.line}:${this.start.column}`;
			}
		}

		if (this.frame) {
			out += `\n${this.frame}`;
		}

		return out;
	}

	toJSON() {
		return {
			code: this.code,
			message: this.message,
			filename: this.filename,
			start: this.start,
			end: this.end,
			position: this.position,
			frame: this.frame
		};
	}
}
