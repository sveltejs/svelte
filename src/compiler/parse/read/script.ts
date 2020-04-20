import * as acorn from '../acorn';
import { Parser } from '../index';
import { Script } from '../../interfaces';
import { Node, Program } from 'estree';

const script_closing_tag = '</script>';

function get_context(parser: Parser, attributes: any[], start: number): string {
	const context = attributes.find(attribute => attribute.name === 'context');
	if (!context) return 'default';

	if (context.value.length !== 1 || context.value[0].type !== 'Text') {
		parser.error({
			code: 'invalid-script',
			message: `context attribute must be static`
		}, start);
	}

	const value = context.value[0].data;

	if (value !== 'module') {
		parser.error({
			code: `invalid-script`,
			message: `If the context attribute is supplied, its value must be "module"`
		}, context.start);
	}

	return value;
}

export default function read_script(parser: Parser, start: number, attributes: Node[]): Script {
	const script_start = parser.index;
	const script_end = parser.template.indexOf(script_closing_tag, script_start);

	if (script_end === -1) parser.error({
		code: `unclosed-script`,
		message: `<script> must have a closing tag`
	});

	const source = ' '.repeat(script_start) + parser.template.slice(script_start, script_end);
	parser.index = script_end + script_closing_tag.length;

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
		content: ast,
	};
}
