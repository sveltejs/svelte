import * as acorn from '../acorn';
import { Parser } from '../index';
import { Script } from '../../interfaces';
import { Node, Program } from 'estree';
import { template_errors } from '../errors';

function get_context(parser: Parser, attributes: any[], start: number): string {
	const context = attributes.find(attribute => attribute.name === 'context');
	if (!context) return 'default';

	if (context.value.length !== 1 || context.value[0].type !== 'Text') {
		parser.error(template_errors.dynamic_context_attribute(), start);
	}

	const value = context.value[0].data;

	if (value !== 'module') {
		parser.error(template_errors.fixed_context_attribute(), context.start);
	}

	return value;
}

export default function read_script(parser: Parser, start: number, attributes: Node[]): Script {
	const script_start = parser.index;

	const [data, matched] = parser.read_until(/<\/script\s*>/, template_errors.unclosed_script());

	if (!matched) parser.error(template_errors.unclosed_script());

	const source = parser.template.slice(0, script_start).replace(/[^\n]/g, ' ') + data;
	
	let ast: Program;

	try {
		ast = acorn.parse(source) as any as Program;
	} catch (err) {
		parser.acorn_error(err);
	}

	// TODO is this necessary?
	(ast as any).start = script_start;

	parser.eat(matched, true);

	return {
		type: 'Script',
		start,
		end: parser.index,
		context: get_context(parser, attributes, start),
		content: ast
	};
}
