import deindent from '../../../../utils/deindent.js';
import flattenReference from '../../../../utils/flattenReference.js';

export default function visitEventHandler ( generator, block, state, node, attribute ) {
	const name = attribute.name;

	// TODO verify that it's a valid callee (i.e. built-in or declared method)
	generator.addSourcemapLocations( attribute.expression );

	const flattened = flattenReference( attribute.expression.callee );
	if ( flattened.name !== 'event' && flattened.name !== 'this' ) {
		// allow event.stopPropagation(), this.select() etc
		generator.code.prependRight( attribute.expression.start, `${block.component}.` );
	}

	const usedContexts = [];
	attribute.expression.arguments.forEach( arg => {
		const { contexts } = generator.contextualise( block, arg, true );

		contexts.forEach( context => {
			if ( !~usedContexts.indexOf( context ) ) usedContexts.push( context );
			if ( !~state.allUsedContexts.indexOf( context ) ) state.allUsedContexts.push( context );
		});
	});

	// TODO hoist event handlers? can do `this.__component.method(...)`
	const declarations = usedContexts.map( name => {
		if ( name === 'root' ) return 'var root = this.__svelte.root;';

		const listName = block.listNames.get( name );
		const indexName = block.indexNames.get( name );

		return `var ${listName} = this.__svelte.${listName}, ${indexName} = this.__svelte.${indexName}, ${name} = ${listName}[${indexName}]`;
	});

	const handlerName = block.getUniqueName( `${name}_handler` );
	const handlerBody = ( declarations.length ? declarations.join( '\n' ) + '\n\n' : '' ) + `[✂${attribute.expression.start}-${attribute.expression.end}✂];`;

	if ( generator.events.has( name ) ) {
		block.builders.create.addBlock( deindent`
			var ${handlerName} = ${generator.alias( 'template' )}.events.${name}.call( ${block.component}, ${state.parentNode}, function ( event ) {
				${handlerBody}
			}.bind( ${state.parentNode} ) );
		` );

		block.builders.destroy.addLine( deindent`
			${handlerName}.teardown();
		` );
	} else {
		block.builders.create.addBlock( deindent`
			function ${handlerName} ( event ) {
				${handlerBody}
			}

			${generator.helper( 'addEventListener' )}( ${state.parentNode}, '${name}', ${handlerName} );
		` );

		block.builders.destroy.addLine( deindent`
			${generator.helper( 'removeEventListener' )}( ${state.parentNode}, '${name}', ${handlerName} );
		` );
	}
}