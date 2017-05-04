import flattenReference from '../../../../../utils/flattenReference.js';
import deindent from '../../../../../utils/deindent.js';

const associatedEvents = {
	innerWidth: 'resize',
	innerHeight: 'resize',
	outerWidth: 'resize',
	outerHeight: 'resize',

	scrollX: 'scroll',
	scrollY: 'scroll'
};

const readonly = new Set([
	'innerWidth',
	'innerHeight',
	'outerWidth',
	'outerHeight',
	'online'
]);

export default function visitWindow ( generator, block, node ) {
	const events = {};
	const bindings = {};

	node.attributes.forEach( attribute => {
		if ( attribute.type === 'EventHandler' ) {
			// TODO verify that it's a valid callee (i.e. built-in or declared method)
			generator.addSourcemapLocations( attribute.expression );

			let usesState = false;

			attribute.expression.arguments.forEach( arg => {
				const { contexts } = block.contextualise( arg, null, true );
				if ( contexts.length ) usesState = true;
			});

			const flattened = flattenReference( attribute.expression.callee );
			if ( flattened.name !== 'event' && flattened.name !== 'this' ) {
				// allow event.stopPropagation(), this.select() etc
				generator.code.prependRight( attribute.expression.start, `${block.component}.` );
			}

			const handlerName = block.getUniqueName( `onwindow${attribute.name}` );
			const handlerBody = deindent`
				${usesState && `var state = ${block.component}.get();`}
				[✂${attribute.expression.start}-${attribute.expression.end}✂];
			`;

			block.builders.create.addBlock( deindent`
				function ${handlerName} ( event ) {
					${handlerBody}
				};
				window.addEventListener( '${attribute.name}', ${handlerName} );
			` );

			block.builders.destroy.addBlock( deindent`
				window.removeEventListener( '${attribute.name}', ${handlerName} );
			` );
		}

		if ( attribute.type === 'Binding' ) {
			if ( attribute.value.type !== 'Identifier' ) {
				const { parts, keypath } = flattenReference( attribute.value );
				throw new Error( `Bindings on <:Window/> must be to top-level properties, e.g. '${parts.pop()}' rather than '${keypath}'` );
			}

			// in dev mode, throw if read-only values are written to
			if ( readonly.has( attribute.name ) ) {
				generator.readonly.add( attribute.value.name );
			}

			bindings[ attribute.name ] = attribute.value.name;

			// bind:online is a special case, we need to listen for two separate events
			if ( attribute.name === 'online' ) return;

			const associatedEvent = associatedEvents[ attribute.name ];

			if ( !associatedEvent ) {
				throw new Error( `Cannot bind to ${attribute.name} on <:Window>` );
			}

			if ( !events[ associatedEvent ] ) events[ associatedEvent ] = [];
			events[ associatedEvent ].push( `${attribute.value.name}: this.${attribute.name}` );

			// add initial value
			generator.metaBindings.push(
				`this._state.${attribute.value.name} = window.${attribute.name};`
			);
		}
	});

	const lock = block.getUniqueName( `window_updating` );

	Object.keys( events ).forEach( event => {
		const handlerName = block.getUniqueName( `onwindow${event}` );
		const props = events[ event ].join( ',\n' );

		if ( event === 'scroll' ) { // TODO other bidirectional bindings...
			block.addVariable( lock, 'false' );
		}

		const handlerBody = deindent`
			${event === 'scroll' && `${lock} = true;`}
			${generator.options.dev && `component._updatingReadonlyProperty = true;`}

			${block.component}.set({
				${props}
			});

			${generator.options.dev && `component._updatingReadonlyProperty = false;`}
			${event === 'scroll' && `${lock} = false;`}
		`;

		block.builders.create.addBlock( deindent`
			function ${handlerName} ( event ) {
				${handlerBody}
			};
			window.addEventListener( '${event}', ${handlerName} );
		` );

		block.builders.destroy.addBlock( deindent`
			window.removeEventListener( '${event}', ${handlerName} );
		` );
	});

	// special case... might need to abstract this out if we add more special cases
	if ( bindings.scrollX && bindings.scrollY ) {
		const observerCallback = block.getUniqueName( `scrollobserver` );

		block.builders.create.addBlock( deindent`
			function ${observerCallback} () {
				if ( ${lock} ) return;
				var x = ${bindings.scrollX ? `${block.component}.get( '${bindings.scrollX}' )` : `window.scrollX`};
				var y = ${bindings.scrollY ? `${block.component}.get( '${bindings.scrollY}' )` : `window.scrollY`};
				window.scrollTo( x, y );
			};
		` );

		if ( bindings.scrollX ) block.builders.create.addLine( `${block.component}.observe( '${bindings.scrollX}', ${observerCallback} );` );
		if ( bindings.scrollY ) block.builders.create.addLine( `${block.component}.observe( '${bindings.scrollY}', ${observerCallback} );` );
	} else if ( bindings.scrollX || bindings.scrollY ) {
		const isX = !!bindings.scrollX;

		block.builders.create.addBlock( deindent`
			${block.component}.observe( '${bindings.scrollX || bindings.scrollY}', function ( ${isX ? 'x' : 'y'} ) {
				if ( ${lock} ) return;
				window.scrollTo( ${isX ? 'x, window.scrollY' : 'window.scrollX, y' } );
			});
		` );
	}

	// another special case. (I'm starting to think these are all special cases.)
	if ( bindings.online ) {
		const handlerName = block.getUniqueName( `onlinestatuschanged` );
		block.builders.create.addBlock( deindent`
			function ${handlerName} ( event ) {
				${block.component}.set({ ${bindings.online}: navigator.onLine });
			};
			window.addEventListener( 'online', ${handlerName} );
			window.addEventListener( 'offline', ${handlerName} );
		` );

		// add initial value
		generator.metaBindings.push(
			`this._state.${bindings.online} = navigator.onLine;`
		);

		block.builders.destroy.addBlock( deindent`
			window.removeEventListener( 'online', ${handlerName} );
			window.removeEventListener( 'offline', ${handlerName} );
		` );
	}
}