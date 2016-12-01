import deindent from '../utils/deindent.js';

export default {
	enter ( generator, node ) {
		const name = generator.current.counter( 'text' );
		const { snippet } = generator.contextualise( node.expression );

		generator.addSourcemapLocations( node.expression );

		if (node.expression.name === 'yield') {
			if (generator.hasYield === undefined) {
				generator.hasYield	= true;
				generator.current.initStatements.push( deindent`
					component.yield = ${generator.current.target};
				` );
			} else {
				throw new Error( `Only one {{yield}} per component.` );
			}
		} else {
			generator.addElement( name, `document.createTextNode( ${snippet} )`, true );

			generator.current.updateStatements.push( deindent`
				${name}.data = ${snippet};
			` );
		}
	}
};
