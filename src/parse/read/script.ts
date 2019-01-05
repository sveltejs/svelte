import * as acorn from '../acorn';
import repeat from '../../utils/repeat';
import { Parser } from '../index';
import { Node } from '../../interfaces';

const scriptClosingTag = '</script>';

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
		attributes,
		content: ast,
	};
}
