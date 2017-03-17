import deindent from '../../../../utils/deindent.js';
import flattenReference from '../../../../utils/flattenReference.js';
import getSetter from './binding/getSetter.js';
import getStaticAttributeValue from './binding/getStaticAttributeValue.js';

export default function createBinding ( generator, node, attribute, current, local ) {
	const { name, keypath } = flattenReference( attribute.value );
	const { snippet, contexts, dependencies } = generator.contextualise( attribute.value );

	if ( dependencies.length > 1 ) throw new Error( 'An unexpected situation arose. Please raise an issue at https://github.com/sveltejs/svelte/issues — thanks!' );

	contexts.forEach( context => {
		if ( !~local.allUsedContexts.indexOf( context ) ) local.allUsedContexts.push( context );
	});

	const handler = current.getUniqueName( `${local.name}ChangeHandler` );

	const isMultipleSelect = node.name === 'select' && node.attributes.find( attr => attr.name.toLowerCase() === 'multiple' ); // TODO use getStaticAttributeValue
	const bindingGroup = attribute.name === 'group' ? getBindingGroup( generator, current, attribute, keypath ) : null;
	const value = getBindingValue( generator, local, node, attribute, isMultipleSelect, bindingGroup );
	const eventName = getBindingEventName( node );

	let setter = getSetter({ current, name, context: '__svelte', attribute, dependencies, snippet, value });
	let updateElement;

	// <select> special case
	if ( node.name === 'select' ) {
		if ( !isMultipleSelect ) {
			setter = `var selectedOption = ${local.name}.selectedOptions[0] || ${local.name}.options[0];\n` + setter;
		}

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
	}

	// <input type='checkbox|radio' bind:group='selected'> special case
	else if ( attribute.name === 'group' ) {
		const type = getStaticAttributeValue( node, 'type' );

		if ( type === 'checkbox' ) {
			local.init.addLine(
				`component._bindingGroups[${bindingGroup}].push( ${local.name} );`
			);

			local.teardown.addBlock(
				`component._bindingGroups[${bindingGroup}].splice( component._bindingGroups[${bindingGroup}].indexOf( ${local.name} ), 1 );`
			);

			updateElement = `${local.name}.checked = ~${snippet}.indexOf( ${local.name}.__value );`;
		}

		else if ( type === 'radio' ) {
			throw new Error( 'TODO' );
		}

		else {
			throw new Error( `Unexpected bind:group` ); // TODO catch this in validation with a better error
		}
	}

	// everything else
	else {
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

function getBindingValue ( generator, local, node, attribute, isMultipleSelect, bindingGroup ) {
	// <select multiple bind:value='selected>
	if ( isMultipleSelect ) {
		return `[].map.call( ${local.name}.selectedOptions, function ( option ) { return option.__value; })`;
	}

	// <select bind:value='selected>
	if ( node.name === 'select' ) {
		return 'selectedOption && selectedOption.__value';
	}

	// <input type='checkbox' bind:group='foo'>
	if ( attribute.name === 'group' ) {
		return `${generator.helper( 'getBindingGroupValue' )}( component._bindingGroups[${bindingGroup}] )`;
	}

	// everything else
	return `${local.name}.${attribute.name}`;
}

function getBindingGroup ( generator, current, attribute, keypath ) {
	// TODO handle contextual bindings — `keypath` should include unique ID of
	// each block that provides context
	let index = generator.bindingGroups.indexOf( keypath );
	if ( index === -1 ) {
		index = generator.bindingGroups.length;
		generator.bindingGroups.push( keypath );
	}

	return index;
}