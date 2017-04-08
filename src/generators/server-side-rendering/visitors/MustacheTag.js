export default function visitMustacheTag ( generator, block, node ) {
	const { snippet } = generator.contextualise( block, node.expression );
	generator.append( '${__escape( ' + snippet + ' )}' );
}