import deindent from '../utils/deindent.js';

export default function createBinding ( node, name, attribute, current, initStatements, updateStatements, teardownStatements, allUsedContexts ) {
	const parts = attribute.value.split( '.' );

	const deep = parts.length > 1;
	const contextual = parts[0] in current.contexts;
	if ( contextual ) allUsedContexts.add( parts[0] );

	const handler = current.counter( `${name}ChangeHandler` );
	let setter;

	let eventName = 'change';
	if ( node.name === 'input' ) {
		const type = node.attributes.find( attr => attr.type === 'Attribute' && attr.name === 'type' );
		if ( !type || type.value[0].data === 'text' ) {
			// TODO in validation, should throw if type attribute is not static
			eventName = 'input';
		}
	}

	if ( contextual ) {
		// TODO can we target only things that have changed?
		// TODO computed values/observers that depend on this probably won't update...
		const listName = current.listNames[ parts[0] ];
		const indexName = current.indexNames[ parts[0] ];

		setter = deindent`
			var list = this.__svelte.${listName};
			var index = this.__svelte.${indexName};
			list[index]${parts.slice( 1 ).map( part => `.${part}` ).join( '' )} = this.${attribute.name};

			component.set({});
		`;
	} else if ( deep ) {
		setter = deindent`
			var ${parts[0]} = component.get( '${parts[0]}' );
			${parts[0]}.${parts.slice( 1 ).join( '.' )} = this.${attribute.name};
			component.set({ ${parts[0]}: ${parts[0]} });
		`;
	} else {
		setter = `component.set({ ${attribute.value}: ${name}.${attribute.name} });`;
	}

	initStatements.push( deindent`
		var ${name}_updating = false;

		function ${handler} () {
			${name}_updating = true;
			${setter}
			${name}_updating = false;
		}

		${name}.addEventListener( '${eventName}', ${handler}, false );
	` );

	updateStatements.push( deindent`
		if ( !${name}_updating ) ${name}.${attribute.name} = ${contextual ? attribute.value : `root.${attribute.value}`}
	` );

	teardownStatements.push( deindent`
		${name}.removeEventListener( '${eventName}', ${handler}, false );
	` );
}
