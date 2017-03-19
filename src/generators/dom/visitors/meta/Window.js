import flattenReference from '../../../../utils/flattenReference.js';
import deindent from '../../../../utils/deindent.js';

export default {
	enter ( generator, node ) {
		node.attributes.forEach( attribute => {
			if ( attribute.type === 'EventHandler' ) {
				// TODO verify that it's a valid callee (i.e. built-in or declared method)
				generator.addSourcemapLocations( attribute.expression );

				const flattened = flattenReference( attribute.expression.callee );
				if ( flattened.name !== 'event' && flattened.name !== 'this' ) {
					// allow event.stopPropagation(), this.select() etc
					generator.code.prependRight( attribute.expression.start, 'component.' );
				}

				const handlerName = generator.current.getUniqueName( `onwindow${attribute.name}` );

				generator.current.builders.init.addBlock( deindent`
					var ${handlerName} = function ( event ) {
						[✂${attribute.expression.start}-${attribute.expression.end}✂];
					};
					window.addEventListener( '${attribute.name}', ${handlerName} );
				` );

				generator.current.builders.teardown.addBlock( deindent`
					window.removeEventListener( '${attribute.name}', ${handlerName} );
				` );
			}
		});
	}
};
