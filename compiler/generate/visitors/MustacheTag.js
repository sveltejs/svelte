import deindent from '../utils/deindent.js';
import isReference from '../utils/isReference.js';

export default {
	enter ( generator, node ) {
		const name = generator.current.counter( 'text' );

		generator.current.initStatements.push( deindent`
			var ${name} = document.createTextNode( '' );
			var ${name}_value = '';
			${generator.current.target}.appendChild( ${name} );
		` );

		generator.addSourcemapLocations( node.expression );

		const usedContexts = generator.contextualise( node.expression );
		const snippet = `[✂${node.expression.start}-${node.expression.end}✂]`;

		if ( isReference( node.expression ) ) {
			const reference = `${generator.source.slice( node.expression.start, node.expression.end )}`;
			const qualified = usedContexts[0] === 'root' ? `root.${reference}` : reference;

			generator.current.updateStatements.push( deindent`
				if ( ${snippet} !== ${name}_value ) {
					${name}_value = ${qualified};
					${name}.data = ${name}_value;
				}
			` );
		} else {
			const temp = generator.getName( 'temp' );

			generator.current.updateStatements.push( deindent`
				var ${temp} = ${snippet};
				if ( ${temp} !== ${name}_value ) {
					${name}_value = ${temp};
					${name}.data = ${name}_value;
				}
			` );
		}
	}
};
