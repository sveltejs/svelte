import deindent from '../utils/deindent.js';
import isReference from '../utils/isReference.js';

export default {
	enter ( generator, node ) {
		const name = generator.current.counter( 'text' );

		const { snippet, string } = generator.contextualise( node.expression );

		generator.current.initStatements.push( deindent`
			var ${name} = document.createTextNode( ${snippet} );
			${generator.current.target}.appendChild( ${name} );
		` );

		generator.addSourcemapLocations( node.expression );

		generator.current.updateStatements.push( deindent`
			${name}.data = ${string};
		` );
	}
};
