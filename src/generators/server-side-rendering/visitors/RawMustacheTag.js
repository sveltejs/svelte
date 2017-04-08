export default function visitRawMustacheTag ( generator, block, node ) {
	const { snippet } = generator.contextualise( block, node.expression );
	generator.append( '${' + snippet + '}' );
}