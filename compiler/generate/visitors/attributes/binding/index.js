import deindent from '../../../utils/deindent.js';
import isReference from '../../../utils/isReference.js';
import flattenReference from '../../../utils/flattenReference.js';

export default function createBinding ( node, attribute, current, local ) {
	const parts = attribute.value.split( '.' );

	const deep = parts.length > 1;
	const contextual = parts[0] in current.contexts;
	if ( contextual ) local.allUsedContexts.add( parts[0] );

	const handler = current.counter( `${local.name}ChangeHandler` );
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
		// find the top-level property that this is a child of
		let fragment = current;
		let prop = parts[0];

		do {
			if ( fragment.expression && fragment.context === prop ) {
				if ( !isReference( fragment.expression  ) ) {
					// TODO this should happen in prior validation step
					throw new Error( `${prop} is read-only, it cannot be bound` );
				}

				prop = flattenReference( fragment.expression ).name;
			}
		} while ( fragment = fragment.parent );

		const listName = current.listNames[ parts[0] ];
		const indexName = current.indexNames[ parts[0] ];

		setter = deindent`
			var list = this.__svelte.${listName};
			var index = this.__svelte.${indexName};
			list[index]${parts.slice( 1 ).map( part => `.${part}` ).join( '' )} = this.${attribute.name};

			component.set({ ${prop}: component.get( '${prop}' ) });
		`;
	} else if ( deep ) {
		setter = deindent`
			var ${parts[0]} = component.get( '${parts[0]}' );
			${parts[0]}.${parts.slice( 1 ).join( '.' )} = this.${attribute.name};
			component.set({ ${parts[0]}: ${parts[0]} });
		`;
	} else {
		const value = local.isComponent ? `value` : `${local.name}.${attribute.name}`;
		setter = `component.set({ ${attribute.value}: ${value} });`;
	}

	if ( local.isComponent ) {
		local.init.push( deindent`
			var ${local.name}_updating = false;

			${local.name}.observe( '${attribute.name}', function ( value ) {
				${local.name}_updating = true;
				${setter}
				${local.name}_updating = false;
			});
		` );

		local.update.push( deindent`
			if ( !${local.name}_updating ) ${local.name}.set({ ${attribute.name}: ${contextual ? attribute.value : `root.${attribute.value}`} });
		` );
	} else {
		local.init.push( deindent`
			var ${local.name}_updating = false;

			function ${handler} () {
				${local.name}_updating = true;
				${setter}
				${local.name}_updating = false;
			}

			${local.name}.addEventListener( '${eventName}', ${handler}, false );
		` );

		local.update.push( deindent`
			if ( !${local.name}_updating ) ${local.name}.${attribute.name} = ${contextual ? attribute.value : `root.${attribute.value}`}
		` );

		local.teardown.push( deindent`
			${local.name}.removeEventListener( '${eventName}', ${handler}, false );
		` );
	}
}
