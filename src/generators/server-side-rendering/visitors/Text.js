export default {
	enter ( generator, node ) {
		generator.fire( 'append', node.data.replace( /\${/g, '\\${' ) );
	}
};
