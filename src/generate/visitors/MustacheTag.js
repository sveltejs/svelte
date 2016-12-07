import deindent from '../../utils/deindent.js';

export default {
	enter ( generator, node ) {
		const name = generator.current.getUniqueName( 'text' );

		generator.addSourcemapLocations( node.expression );
		const { snippet } = generator.contextualise( node.expression );

		generator.addElement( name, `document.createTextNode( ${snippet} )`, true );

		generator.current.updateStatements.push( deindent`
			${name}.data = ${snippet};
		` );
	}
};
