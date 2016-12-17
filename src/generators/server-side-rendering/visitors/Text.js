export default {
	enter ( generator, node ) {
		generator.append( node.data.replace( /\${/g, '\\${' ) );
	}
};
