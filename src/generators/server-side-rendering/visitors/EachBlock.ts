import visit from '../visit';
import { SsrGenerator } from '../index';
import Block from '../Block';
import { Node } from '../../../interfaces';

export default function visitEachBlock(
	generator: SsrGenerator,
	block: Block,
	node: Node
) {
	const { snippet } = node.expression;

	const props = [`${node.context}: item`]
		.concat(node.destructuredContexts.map((name, i) => `${name}: item[${i}]`));

	const getContext = node.index
		? `(item, i) => Object.assign({}, ctx, { ${props.join(', ')}, ${node.index}: i })`
		: `item => Object.assign({}, ctx, { ${props.join(', ')} })`;

	const open = `\${ ${node.else ? `${snippet}.length ? ` : ''}__each(${snippet}, ${getContext}, ctx => \``;
	generator.append(open);

	const childBlock = block.child({});

	node.children.forEach((child: Node) => {
		visit(generator, childBlock, child);
	});

	const close = `\`)`;
	generator.append(close);

	if (node.else) {
		generator.append(` : \``);
		node.else.children.forEach((child: Node) => {
			visit(generator, block, child);
		});
		generator.append(`\``);
	}

	generator.append('}');
}
