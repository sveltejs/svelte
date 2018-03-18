import { locate } from 'locate-character';
import getCodeFrame from '../utils/getCodeFrame';

export default class CompileError extends Error {
	frame: string;
	loc: { line: number; column: number };
	end: { line: number; column: number };
	pos: number;
	filename: string;

	constructor(
		message: string,
		template: string,
		startPos: number,
		filename: string,
		endPos: number = startPos
	) {
		super(message);

		const start = locate(template, startPos);
		const end = locate(template, endPos);

		this.loc = { line: start.line + 1, column: start.column };
		this.end = { line: end.line + 1, column: end.column };
		this.pos = startPos;
		this.filename = filename;

		this.frame = getCodeFrame(template, start.line, start.column);
	}

	public toString = () => {
		return `${this.message} (${this.loc.line}:${this.loc.column})\n${this
			.frame}`;
	}
}
