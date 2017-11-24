import visit from '../visit';
import { SsrGenerator } from '../index';
import Block from '../Block';
import { Node } from '../../../interfaces';

export default function visitEachBlock(
	generator: SsrGenerator,
	block: Block,
	node: Node
) {
	block.contextualise(node.expression);
	const { dependencies, snippet } = node.metadata;

	const open = `\${ ${node.else ? `${snippet}.length ? ` : ''}${snippet}.map(${node.index ? `(${node.context}, ${node.index})` : node.context} => \``;
	generator.append(open);

	// TODO should this be the generator's job? It's duplicated between
	// here and the equivalent DOM compiler visitor
	const contexts = new Map(block.contexts);
	contexts.set(node.context, node.context);

	const indexes = new Map(block.indexes);
	if (node.index) indexes.set(node.index, node.context);

	const contextDependencies = new Map(block.contextDependencies);
	contextDependencies.set(node.context, dependencies);

	if (node.destructuredContexts) {
		for (let i = 0; i < node.destructuredContexts.length; i += 1) {
			contexts.set(node.destructuredContexts[i], `${node.context}[${i}]`);
			contextDependencies.set(node.destructuredContexts[i], dependencies);
		}
	}

	const childBlock = block.child({
		contexts,
		indexes,
		contextDependencies,
	});

	node.children.forEach((child: Node) => {
		visit(generator, childBlock, child);
	});

	const close = `\`).join("")`;
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
