import deindent from '../utils/deindent.js';

export default {
	enter ( generator, node ) {
		if ( generator.elementDepth > 1 ) {
			generator.current.initStatements.push( deindent`
				${generator.current.target}.appendChild( document.createTextNode( ${JSON.stringify( node.data )} ) );
			` );
		} else {
			const name = generator.current.counter( `text` );

			generator.current.initStatements.push( deindent`
				var ${name} = document.createTextNode( ${JSON.stringify( node.data )} );
				${generator.appendToTarget( name )};
			` );

			generator.current.teardownStatements.push( deindent`
				if ( detach ) ${name}.parentNode.removeChild( ${name} );
			` );
		}
	}
};
