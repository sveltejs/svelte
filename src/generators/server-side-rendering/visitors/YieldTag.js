export default {
	enter ( generator ) {
		generator.append( `\${options.yield()}` );
	}
};
