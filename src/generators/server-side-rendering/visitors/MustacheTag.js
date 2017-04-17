export default function visitMustacheTag ( generator, block, node ) {
	const { snippet } = block.contextualise( node.expression );
	generator.append( '${__escape( ' + snippet + ' )}' );
}