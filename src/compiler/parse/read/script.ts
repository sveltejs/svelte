import * as acorn from '../acorn';
import repeat from '../../utils/repeat';
import { Parser } from '../index';
import { Node } from '../../interfaces';

const script_closing_tag = '</script>';

function get_context(parser: Parser, attributes: Node[], start: number) {
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

export default function read_script(parser: Parser, start: number, attributes: Node[]) {
	const script_start = parser.index;
	const script_end = parser.template.indexOf(script_closing_tag, script_start);

	if (script_end === -1) parser.error({
		code: `unclosed-script`,
		message: `<script> must have a closing tag`
	});

	const source =
		repeat(' ', script_start) + parser.template.slice(script_start, script_end);
	parser.index = script_end + script_closing_tag.length;

	let ast;

	try {
		ast = acorn.parse(source);
	} catch (err) {
		parser.acorn_error(err);
	}

	ast.start = script_start;
	return {
		start,
		end: parser.index,
		context: get_context(parser, attributes, start),
		content: ast,
	};
}
