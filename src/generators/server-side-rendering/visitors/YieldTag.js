export default {
	enter ( generator ) {
		generator.append( `\${options && options.yield ? options.yield() : ''}` );
	}
};
