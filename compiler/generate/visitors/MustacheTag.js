import deindent from '../utils/deindent.js';

export default {
	enter ( generator, node ) {
		const name = generator.current.counter( 'text' );

		generator.addSourcemapLocations( node.expression );
		const { snippet } = generator.contextualise( node.expression );

		generator.addElement( name, `document.createTextNode( ${snippet} )` );

		generator.current.updateStatements.push( deindent`
			instance.${name}.data = ${snippet};
		` );
	}
};
