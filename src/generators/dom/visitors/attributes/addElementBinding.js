import deindent from '../../../../utils/deindent.js';
import flattenReference from '../../../../utils/flattenReference.js';
import getSetter from './binding/getSetter.js';

export default function createBinding ( generator, node, attribute, current, local ) {
	const { name } = flattenReference( attribute.value );
	const { snippet, contexts, dependencies } = generator.contextualise( attribute.value );

	if ( dependencies.length > 1 ) throw new Error( 'An unexpected situation arose. Please raise an issue at https://github.com/sveltejs/svelte/issues — thanks!' );

	contexts.forEach( context => {
		if ( !~local.allUsedContexts.indexOf( context ) ) local.allUsedContexts.push( context );
	});

	const handler = current.getUniqueName( `${local.name}ChangeHandler` );

	const isMultipleSelect = node.name === 'select' && node.attributes.find( attr => attr.name.toLowerCase() === 'multiple' ); // TODO ensure that this is a static attribute
	const value = getBindingValue( local, node, attribute, isMultipleSelect );
	const eventName = getBindingEventName( node );

	let setter = getSetter({ current, name, context: '__svelte', attribute, dependencies, snippet, value });

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
			var ${value} = ${snippet};
			for ( var ${i} = 0; ${i} < ${local.name}.options.length; ${i} += 1 ) {
				var ${option} = ${local.name}.options[${i}];

				${ifStatement}
			}
		`;
	} else {
		updateElement = `${local.name}.${attribute.name} = ${snippet};`;
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

function getBindingEventName ( node ) {
	if ( node.name === 'input' ) {
		const typeAttribute = node.attributes.find( attr => attr.type === 'Attribute' && attr.name === 'type' );
		const type = typeAttribute ? typeAttribute.value[0].data : 'text'; // TODO in validation, should throw if type attribute is not static

		return type === 'checkbox' || type === 'radio' ? 'change' : 'input';
	}

	if ( node.name === 'textarea' ) {
		return 'input';
	}

	return 'change';
}

function getBindingValue ( local, node, attribute, isMultipleSelect ) {
	if ( isMultipleSelect ) {
		return `[].map.call( ${local.name}.selectedOptions, function ( option ) { return option.__value; })`;
	}

	if ( node.name === 'select' ) {
		return 'selectedOption && selectedOption.__value';
	}

	return `${local.name}.${attribute.name}`;
}