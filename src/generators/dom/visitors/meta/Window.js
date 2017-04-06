import flattenReference from '../../../../utils/flattenReference.js';
import deindent from '../../../../utils/deindent.js';

const associatedEvents = {
	innerWidth: 'resize',
	innerHeight: 'resize',
	outerWidth: 'resize',
	outerHeight: 'resize',

	scrollX: 'scroll',
	scrollY: 'scroll'
};

export default function visitWindow ( generator, fragment, node ) {
	const events = {};

	node.attributes.forEach( attribute => {
		if ( attribute.type === 'EventHandler' ) {
			// TODO verify that it's a valid callee (i.e. built-in or declared method)
			generator.addSourcemapLocations( attribute.expression );

			const flattened = flattenReference( attribute.expression.callee );
			if ( flattened.name !== 'event' && flattened.name !== 'this' ) {
				// allow event.stopPropagation(), this.select() etc
				generator.code.prependRight( attribute.expression.start, 'component.' );
			}

			const handlerName = fragment.getUniqueName( `onwindow${attribute.name}` );

			fragment.builders.create.addBlock( deindent`
				var ${handlerName} = function ( event ) {
					[✂${attribute.expression.start}-${attribute.expression.end}✂];
				};
				window.addEventListener( '${attribute.name}', ${handlerName} );
			` );

			fragment.builders.destroy.addBlock( deindent`
				window.removeEventListener( '${attribute.name}', ${handlerName} );
			` );
		}

		if ( attribute.type === 'Binding' ) {
			const associatedEvent = associatedEvents[ attribute.name ];

			if ( !associatedEvent ) {
				throw new Error( `Cannot bind to ${attribute.name} on <:Window>` );
			}

			if ( attribute.value.type !== 'Identifier' ) {
				const { parts, keypath } = flattenReference( attribute.value );
				throw new Error( `Bindings on <:Window/> must be to top-level properties, e.g. '${parts.pop()}' rather than '${keypath}'` );
			}

			if ( !events[ associatedEvent ] ) events[ associatedEvent ] = [];
			events[ associatedEvent ].push( `${attribute.value.name}: this.${attribute.name}` );

			// add initial value
			generator.builders.metaBindings.addLine(
				`this._state.${attribute.value.name} = window.${attribute.name};`
			);
		}
	});

	Object.keys( events ).forEach( event => {
		const handlerName = fragment.getUniqueName( `onwindow${event}` );

		const props = events[ event ].join( ',\n' );

		fragment.builders.create.addBlock( deindent`
			var ${handlerName} = function ( event ) {
				component.set({
					${props}
				});
			};
			window.addEventListener( '${event}', ${handlerName} );
		` );

		fragment.builders.destroy.addBlock( deindent`
			window.removeEventListener( '${event}', ${handlerName} );
		` );
	});
}