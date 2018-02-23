import * as acorn from 'acorn';
import injectDynamicImport from 'acorn-dynamic-import/src/inject';
import repeat from '../../utils/repeat';
import { Parser } from '../index';
import { Node } from '../../interfaces';

const scriptClosingTag = '</script>';

injectDynamicImport(acorn);

export default function readScript(parser: Parser, start: number, attributes: Node[]) {
	const scriptStart = parser.index;
	const scriptEnd = parser.template.indexOf(scriptClosingTag, scriptStart);

	if (scriptEnd === -1) parser.error(`<script> must have a closing tag`);

	const source =
		repeat(' ', scriptStart) + parser.template.slice(scriptStart, scriptEnd);
	parser.index = scriptEnd + scriptClosingTag.length;

	let ast;

	try {
		ast = acorn.parse(source, {
			ecmaVersion: 9,
			sourceType: 'module',
			plugins: {
				dynamicImport: true
			}
		});
	} catch (err) {
		parser.acornError(err);
	}

	if (!ast.body.length) return null;

	ast.start = scriptStart;
	return {
		start,
		end: parser.index,
		attributes,
		content: ast,
	};
}
