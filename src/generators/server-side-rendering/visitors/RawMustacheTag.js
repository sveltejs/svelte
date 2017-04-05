export default function visitRawMustacheTag ( generator, node ) {
	const { snippet } = generator.contextualise( node.expression );
	generator.append( '${' + snippet + '}' );
}