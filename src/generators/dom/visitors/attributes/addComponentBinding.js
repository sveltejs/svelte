import deindent from '../../../../utils/deindent.js';
import isReference from '../../../../utils/isReference.js';
import flattenReference from '../../../../utils/flattenReference.js';

export default function createBinding ( generator, node, attribute, current, local ) {
	const { name, parts, keypath } = flattenReference( attribute.value );

	const contextual = name in current.contexts;

	if ( contextual && !~local.allUsedContexts.indexOf( name ) ) {
		local.allUsedContexts.push( name );
	}

	let obj;
	let prop;
	let value;

	if ( contextual ) {
		obj = current.listNames[ name ];
		prop = current.indexNames[ name ];
		value = keypath;
	} else {
		prop = `'${parts.slice( -1 )}'`;
		obj = parts.length > 1 ? `root.${parts.slice( 0, -1 ).join( '.' )}` : `root`;
		value = `root.${keypath}`;
	}

	local.bindings.push({ name: attribute.name, value, obj, prop });

	let setter;

	if ( contextual ) {
		// find the top-level property that this is a child of
		let fragment = current;
		let prop = name;

		do {
			if ( fragment.expression && fragment.context === prop ) {
				if ( !isReference( fragment.expression ) ) {
					// TODO this should happen in prior validation step
					throw new Error( `${prop} is read-only, it cannot be bound` );
				}

				prop = flattenReference( fragment.expression ).name;
			}
		} while ( fragment = fragment.parent );

		generator.expectedProperties[ prop ] = true;

		const listName = current.listNames[ name ];
		const indexName = current.indexNames[ name ];

		const context = local.isComponent ? `_context` : `__svelte`;

		setter = deindent`
			var list = this.${context}.${listName};
			var index = this.${context}.${indexName};
			list[index]${parts.slice( 1 ).map( part => `.${part}` ).join( '' )} = value;

			component._set({ ${prop}: component.get( '${prop}' ) });
		`;
	} else {
		if ( parts.length > 1 ) {
			setter = deindent`
				var ${name} = component.get( '${name}' );
				${name}.${parts.slice( 1 ).join( '.' )} = value;
				component._set({ ${name}: ${name} });
			`;
		} else {
			setter = `component._set({ ${keypath}: value });`;
		}

		generator.expectedProperties[ name ] = true;
	}

	generator.hasComplexBindings = true;

	local.init.addBlock( deindent`
		var ${local.name}_updating = false;

		component._bindings.push( function () {
			if ( ${local.name}._torndown ) return;
			${local.name}.observe( '${attribute.name}', function ( value ) {
				${local.name}_updating = true;
				${setter}
				${local.name}_updating = false;
			});
		});
	` );

	const dependencies = name in current.contexts ? current.contextDependencies[ name ] : [ name ];

	local.update.addBlock( deindent`
		if ( !${local.name}_updating && ${dependencies.map( dependency => `'${dependency}' in changed` ).join( '||' )} ) {
			${local.name}._set({ ${attribute.name}: ${contextual ? keypath : `root.${keypath}`} });
		}
	` );
}
