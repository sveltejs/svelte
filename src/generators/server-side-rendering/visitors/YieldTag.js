export default {
	enter ( generator, node ) {
		generator.fire( 'append', `\${options.yield()}` );
	},

	leave ( generator ) {

	}
};
