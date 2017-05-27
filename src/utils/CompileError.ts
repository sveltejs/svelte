import { locate } from 'locate-character';
import getCodeFrame from '../utils/getCodeFrame';

export default class CompileError extends Error {
	frame: string
	loc: { line: number, column: number }
	pos: number
	filename: string

	constructor ( message: string, template: string, index: number, filename: string ) {
		super( message );

		const { line, column } = locate( template, index );

		this.loc = { line: line + 1, column };
		this.pos = index;
		this.filename = filename;

		this.frame = getCodeFrame( template, line, column );
	}

	toString () {
		return `${this.message} (${this.loc.line}:${this.loc.column})\n${this.frame}`;
	}
}