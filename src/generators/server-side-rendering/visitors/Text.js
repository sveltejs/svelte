export default function visitText ( generator, node ) {
	generator.append( node.data.replace( /\${/g, '\\${' ) );
}