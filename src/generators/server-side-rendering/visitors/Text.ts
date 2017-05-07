export default function visitText ( generator, block, node ) {
	generator.append( node.data.replace( /\${/g, '\\${' ) );
}