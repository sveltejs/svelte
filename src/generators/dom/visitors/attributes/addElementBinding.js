import deindent from '../../../../utils/deindent.js';
import isReference from '../../../../utils/isReference.js';
import flattenReference from '../../../../utils/flattenReference.js';

export default function createBinding ( generator, node, attribute, current, local ) {
	const { name, parts, keypath } = flattenReference( attribute.value );

	const contextual = name in current.contexts;

	if ( contextual && !~local.allUsedContexts.indexOf( name ) ) {
		local.allUsedContexts.push( name );
	}

	const handler = current.getUniqueName( `${local.name}ChangeHandler` );
	let setter;

	let eventName = 'change';
	if ( node.name === 'input' ) {
		const typeAttribute = node.attributes.find( attr => attr.type === 'Attribute' && attr.name === 'type' );
		const type = typeAttribute ? typeAttribute.value[0].data : 'text'; // TODO in validation, should throw if type attribute is not static

		if ( type !== 'checkbox' && type !== 'radio' ) {
			eventName = 'input';
		}
	}

	else if ( node.name === 'textarea' ) {
		eventName = 'input';
	}

	const isMultipleSelect = node.name === 'select' && node.attributes.find( attr => attr.name.toLowerCase() === 'multiple' ); // TODO ensure that this is a static attribute
	let value;

	if ( node.name === 'select' ) {
		if ( isMultipleSelect ) {
			value = `[].map.call( ${local.name}.selectedOptions, function ( option ) { return option.__value; })`;
		} else {
			value = 'selectedOption && selectedOption.__value';
		}
	} else {
		value = `${local.name}.${attribute.name}`;
	}

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
			list[index]${parts.slice( 1 ).map( part => `.${part}` ).join( '' )} = ${value};

			component._set({ ${prop}: component.get( '${prop}' ) });
		`;
	} else {
		if ( parts.length > 1 ) {
			setter = deindent`
				var ${name} = component.get( '${name}' );
				${name}.${parts.slice( 1 ).join( '.' )} = ${value};
				component._set({ ${name}: ${name} });
			`;
		} else {
			setter = `component._set({ ${keypath}: ${value} });`;
		}

		generator.expectedProperties[ name ] = true;
	}

	// special case
	if ( node.name === 'select' && !isMultipleSelect ) {
		setter = `var selectedOption = ${local.name}.selectedOptions[0] || ${local.name}.options[0];\n` + setter;
	}

	let updateElement;

	if ( node.name === 'select' ) {
		const value = generator.current.getUniqueName( 'value' );
		const i = generator.current.getUniqueName( 'i' );
		const option = generator.current.getUniqueName( 'option' );

		const ifStatement = isMultipleSelect ?
			deindent`
				${option}.selected = ~${value}.indexOf( ${option}.__value );` :
			deindent`
				if ( ${option}.__value === ${value} ) {
					${option}.selected = true;
					break;
				}`;

		updateElement = deindent`
			var ${value} = ${contextual ? keypath : `root.${keypath}`};
			for ( var ${i} = 0; ${i} < ${local.name}.options.length; ${i} += 1 ) {
				var ${option} = ${local.name}.options[${i}];

				${ifStatement}
			}
		`;
	} else {
		updateElement = `${local.name}.${attribute.name} = ${contextual ? keypath : `root.${keypath}`};`;
	}

	local.init.addBlock( deindent`
		var ${local.name}_updating = false;

		function ${handler} () {
			${local.name}_updating = true;
			${setter}
			${local.name}_updating = false;
		}

		${generator.helper( 'addEventListener' )}( ${local.name}, '${eventName}', ${handler} );
	` );

	node.initialUpdate = updateElement;

	local.update.addLine( deindent`
		if ( !${local.name}_updating ) {
			${updateElement}
		}
	` );

	generator.current.builders.teardown.addLine( deindent`
		${generator.helper( 'removeEventListener' )}( ${local.name}, '${eventName}', ${handler} );
	` );
}
