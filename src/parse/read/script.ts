import * as acorn from '../acorn';
import repeat from '../../utils/repeat';
import { Parser } from '../index';
import { Node } from '../../interfaces';

const scriptClosingTag = '</script>';

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

export default function readScript(parser: Parser, start: number, attributes: Node[]) {
	const scriptStart = parser.index;
	const scriptEnd = parser.template.indexOf(scriptClosingTag, scriptStart);

	if (scriptEnd === -1) parser.error({
		code: `unclosed-script`,
		message: `<script> must have a closing tag`
	});

	const source =
		repeat(' ', scriptStart) + parser.template.slice(scriptStart, scriptEnd);
	parser.index = scriptEnd + scriptClosingTag.length;

	let ast;

	try {
		ast = acorn.parse(source);
	} catch (err) {
		parser.acornError(err);
	}

	ast.start = scriptStart;
	return {
		start,
		end: parser.index,
		context: get_context(parser, attributes, start),
		content: ast,
	};
}
