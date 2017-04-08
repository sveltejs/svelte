export default function visitText ( generator, fragment, node ) {
	generator.append( node.data.replace( /\${/g, '\\${' ) );
}