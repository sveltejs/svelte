import visit from '../visit';
import { SsrGenerator } from '../index';
import Block from '../Block';
import { Node } from '../../../interfaces';

export default function visitAwaitBlock(
	generator: SsrGenerator,
	block: Block,
	node: Node
) {
	const { snippet } = node.expression;

	// TODO should this be the generator's job? It's duplicated between
	// here and the equivalent DOM compiler visitor
	const contexts = new Map(block.contexts);
	contexts.set(node.value, '__value');

	const childBlock = block.child({
		contexts
	});

	generator.append('${(function(__value) { if(__isPromise(__value)) return `');

	node.pending.children.forEach((child: Node) => {
		visit(generator, childBlock, child);
	});

	generator.append('`; return function(ctx) { return `');

	node.then.children.forEach((child: Node) => {
		visit(generator, childBlock, child);
	});

	generator.append(`\`;}(Object.assign({}, ctx, { ${node.value}: __value }));}(${snippet})) }`);
}
