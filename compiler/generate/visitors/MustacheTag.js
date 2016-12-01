import deindent from '../utils/deindent.js';

export default {
	enter ( generator, node ) {
		const name = generator.current.counter( 'text' );
		const { snippet } = generator.contextualise( node.expression );

		generator.addSourcemapLocations( node.expression );

		if (node.expression.name === 'yield') {
			generator.current.initStatements.push( deindent`
				component.yield = ${generator.current.target};
			` );
		} else {
			generator.addElement( name, `document.createTextNode( ${snippet} )`, true );

			generator.current.updateStatements.push( deindent`
				${name}.data = ${snippet};
			` );
		}
	}
};
