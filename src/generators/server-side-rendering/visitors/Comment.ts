export default function visitComment(
	generator: SsrGenerator,
	block: Block,
	node: Node
) {
	// Allow option to preserve comments, otherwise ignore
	if (generator && generator.options && generator.options.preserveComments) {
		generator.append(`<!--${node.data}-->`);
	}
}
