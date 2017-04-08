export default function visitRawMustacheTag ( generator, fragment, node ) {
	const { snippet } = generator.contextualise( fragment, node.expression );
	generator.append( '${' + snippet + '}' );
}