import { locate } from 'locate-character';
import getCodeFrame from '../utils/getCodeFrame';

class CompileError extends Error {
	code: string;
	loc: { line: number, column: number };
	end: { line: number, column: number };
	pos: number;
	filename: string;
	frame: string;

	toString() {
		return `${this.message} (${this.loc.line}:${this.loc.column})\n${this.frame}`;
	}
}

export default function error(message: string, props: {
	name: string,
	code: string,
	source: string,
	filename: string,
	start: number,
	end?: number
}) {
	const error = new CompileError(message);
	error.name = props.name;

	const start = locate(props.source, props.start);
	const end = locate(props.source, props.end || props.start);

	error.code = props.code;
	error.loc = { line: start.line + 1, column: start.column };
	error.end = { line: end.line + 1, column: end.column };
	error.pos = props.start;
	error.filename = props.filename;

	error.frame = getCodeFrame(props.source, start.line, start.column);

	throw error;
}