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

	// TODO should this be the generator's job? It's duplicated between
	// here and the equivalent DOM compiler visitor
	const contexts = new Map(block.contexts);
	contexts.set(node.context, node.context);

	const indexes = new Map(block.indexes);
	if (node.index) indexes.set(node.index, node.context);

	if (node.destructuredContexts) {
		for (let i = 0; i < node.destructuredContexts.length; i += 1) {
			contexts.set(node.destructuredContexts[i], `${node.context}[${i}]`);
		}
	}

	const childBlock = block.child({
		contexts,
		indexes
	});

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
