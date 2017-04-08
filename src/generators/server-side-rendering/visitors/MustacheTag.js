export default function visitMustacheTag ( generator, fragment, node ) {
	const { snippet } = generator.contextualise( fragment, node.expression );
	generator.append( '${__escape( ' + snippet + ' )}' );
}