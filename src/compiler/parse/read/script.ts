import * as acorn from '../acorn';
import { Parser } from '../index';
import { Script } from '../../interfaces';
import { Node, Program } from 'estree';

function get_context(parser: Parser, attributes: any[], start: number): string {
	const context = attributes.find(attribute => attribute.name === 'context');
	if (!context) return 'default';

	if (context.value.length !== 1 || context.value[0].type !== 'Text') {
		parser.error({
			code: 'invalid-script',
			message: 'context attribute must be static'
		}, start);
	}

	const value = context.value[0].data;

	if (value !== 'module') {
		parser.error({
			code: 'invalid-script',
			message: 'If the context attribute is supplied, its value must be "module"'
		}, context.start);
	}

	return value;
}

export default function read_script(parser: Parser, start: number, attributes: Node[]): Script {
	const script_start = parser.index;
	const error_message = {
		code: 'unclosed-script',
		message: '<script> must have a closing tag'
	};
	const data = parser.read_until(/<\/script\s*>/, error_message);
	if (parser.index >= parser.template.length) {
		parser.error(error_message);
	}

	const source = parser.template.slice(0, script_start).replace(/[^\n]/g, ' ') + data;
	parser.read(/<\/script\s*>/);

	let ast: Program;

	try {
		ast = acorn.parse(source) as any as Program;
	} catch (err) {
		parser.acorn_error(err);
	}

	// TODO is this necessary?
	(ast as any).start = script_start;

	return {
		type: 'Script',
		start,
		end: parser.index,
		context: get_context(parser, attributes, start),
		content: ast
	};
}
