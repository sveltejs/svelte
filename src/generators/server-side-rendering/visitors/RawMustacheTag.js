export default function visitRawMustacheTag ( generator, block, node ) {
	const { snippet } = block.contextualise( node.expression );
	generator.append( '${' + snippet + '}' );
}