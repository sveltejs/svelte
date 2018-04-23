import visit from '../visit';
import { SsrGenerator } from '../index';
import Block from '../Block';
import { Node } from '../../../interfaces';

export default function visitIfBlock(
	generator: SsrGenerator,
	block: Block,
	node: Node
) {
	const { snippet } = node.expression;

	generator.append('${ ' + snippet + ' ? `');

	const childBlock = block.child({
		conditions: block.conditions.concat(snippet),
	});

	node.children.forEach((child: Node) => {
		visit(generator, childBlock, child);
	});

	generator.append('` : `');

	if (node.else) {
		node.else.children.forEach((child: Node) => {
			visit(generator, childBlock, child);
		});
	}

	generator.append('` }');
}
