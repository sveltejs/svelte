export default {
	enter ( generator ) {
		generator.fire( 'append', `\${options.yield()}` );
	}
};
