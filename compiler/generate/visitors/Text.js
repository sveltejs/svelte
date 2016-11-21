import deindent from '../utils/deindent.js';

export default {
	enter ( generator, node ) {
		generator.current.initStatements.push( deindent`
			${generator.current.target}.appendChild( document.createTextNode( ${JSON.stringify( node.data )} ) );
		` );
	}
};
