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

	const handler = current.getUniqueName( `${local.name}_change_handler` );

	const isMultipleSelect = node.name === 'select' && node.attributes.find( attr => attr.name.toLowerCase() === 'multiple' ); // TODO use getStaticAttributeValue
	const type = getStaticAttributeValue( node, 'type' );
	const bindingGroup = attribute.name === 'group' ? getBindingGroup( generator, current, attribute, keypath ) : null;
	const value = getBindingValue( generator, local, node, attribute, isMultipleSelect, bindingGroup, type );
	const eventName = getBindingEventName( node );

	let setter = getSetter({ current, name, keypath, context: '__svelte', attribute, dependencies, value });
	let updateElement;

	// <select> special case
	if ( node.name === 'select' ) {
		if ( !isMultipleSelect ) {
			setter = `var selectedOption = ${local.name}.selectedOptions[0] || ${local.name}.options[0];\n${setter}`;
		}

		const value = current.getUniqueName( 'value' );
		const i = current.getUniqueName( 'i' );
		const option = current.getUniqueName( 'option' );

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
		if ( type === 'radio' ) {
			setter = deindent`
				if ( !${local.name}.checked ) return;
				${setter}
			`;
		}

		const condition = type === 'checkbox' ?
			`~${snippet}.indexOf( ${local.name}.__value )` :
			`${local.name}.__value === ${snippet}`;

		local.create.addLine(
			`${current.component}._bindingGroups[${bindingGroup}].push( ${local.name} );`
		);

		local.destroy.addBlock(
			`${current.component}._bindingGroups[${bindingGroup}].splice( ${current.component}._bindingGroups[${bindingGroup}].indexOf( ${local.name} ), 1 );`
		);

		updateElement = `${local.name}.checked = ${condition};`;
	}

	// everything else
	else {
		updateElement = `${local.name}.${attribute.name} = ${snippet};`;
	}

	const updating = generator.current.getUniqueName( `${local.name}_updating` );

	local.create.addBlock( deindent`
		var ${updating} = false;

		function ${handler} () {
			${updating} = true;
			${setter}
			${updating} = false;
		}

		${generator.helper( 'addEventListener' )}( ${local.name}, '${eventName}', ${handler} );
	` );

	node.initialUpdate = updateElement;

	local.update.addLine( deindent`
		if ( !${updating} ) {
			${updateElement}
		}
	` );

	current.builders.destroy.addLine( deindent`
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

function getBindingValue ( generator, local, node, attribute, isMultipleSelect, bindingGroup, type ) {
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
		if ( type === 'checkbox' ) {
			return `${generator.helper( 'getBindingGroupValue' )}( ${generator.current.component}._bindingGroups[${bindingGroup}] )`;
		}

		return `${local.name}.__value`;
	}

	// <input type='range|number' bind:value>
	if ( type === 'range' || type === 'number' ) {
		return `+${local.name}.${attribute.name}`;
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
