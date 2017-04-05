export default function visitMustacheTag ( generator, node ) {
	const { snippet } = generator.contextualise( node.expression );
	generator.append( '${__escape( ' + snippet + ' )}' );
}