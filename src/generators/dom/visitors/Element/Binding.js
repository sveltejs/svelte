import deindent from '../../../../utils/deindent.js';
import flattenReference from '../../../../utils/flattenReference.js';
import getSetter from '../shared/binding/getSetter.js';
import getStaticAttributeValue from './getStaticAttributeValue.js';

export default function visitBinding ( generator, block, state, node, attribute ) {
	const { name, keypath } = flattenReference( attribute.value );
	const { snippet, contexts, dependencies } = block.contextualise( attribute.value );

	if ( dependencies.length > 1 ) throw new Error( 'An unexpected situation arose. Please raise an issue at https://github.com/sveltejs/svelte/issues — thanks!' );

	contexts.forEach( context => {
		if ( !~state.allUsedContexts.indexOf( context ) ) state.allUsedContexts.push( context );
	});

	const handler = block.getUniqueName( `${state.parentNode}_change_handler` );

	const isMultipleSelect = node.name === 'select' && node.attributes.find( attr => attr.name.toLowerCase() === 'multiple' ); // TODO use getStaticAttributeValue
	const type = getStaticAttributeValue( node, 'type' );
	const bindingGroup = attribute.name === 'group' ? getBindingGroup( generator, keypath ) : null;
	const value = getBindingValue( generator, block, state, node, attribute, isMultipleSelect, bindingGroup, type );
	const eventName = getBindingEventName( node );

	let setter = getSetter({ block, name, keypath, context: '_svelte', attribute, dependencies, value });
	let updateElement;

	// <select> special case
	if ( node.name === 'select' ) {
		if ( !isMultipleSelect ) {
			setter = `var selectedOption = ${state.parentNode}.selectedOptions[0] || ${state.parentNode}.options[0];\n${setter}`;
		}

		const value = block.getUniqueName( 'value' );
		const i = block.getUniqueName( 'i' );
		const option = block.getUniqueName( 'option' );

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
			for ( var ${i} = 0; ${i} < ${state.parentNode}.options.length; ${i} += 1 ) {
				var ${option} = ${state.parentNode}.options[${i}];

				${ifStatement}
			}
		`;
	}

	// <input type='checkbox|radio' bind:group='selected'> special case
	else if ( attribute.name === 'group' ) {
		if ( type === 'radio' ) {
			setter = deindent`
				if ( !${state.parentNode}.checked ) return;
				${setter}
			`;
		}

		const condition = type === 'checkbox' ?
			`~${snippet}.indexOf( ${state.parentNode}.__value )` :
			`${state.parentNode}.__value === ${snippet}`;

		block.builders.create.addLine(
			`${block.component}._bindingGroups[${bindingGroup}].push( ${state.parentNode} );`
		);

		block.builders.destroy.addBlock(
			`${block.component}._bindingGroups[${bindingGroup}].splice( ${block.component}._bindingGroups[${bindingGroup}].indexOf( ${state.parentNode} ), 1 );`
		);

		updateElement = `${state.parentNode}.checked = ${condition};`;
	}

	// everything else
	else {
		updateElement = `${state.parentNode}.${attribute.name} = ${snippet};`;
	}

	const updating = block.getUniqueName( `${state.parentNode}_updating` );

	block.builders.create.addBlock( deindent`
		var ${updating} = false;

		function ${handler} () {
			${updating} = true;
			${setter}
			${updating} = false;
		}

		${generator.helper( 'addEventListener' )}( ${state.parentNode}, '${eventName}', ${handler} );
	` );

	node.initialUpdate = updateElement;

	block.builders.update.addLine( deindent`
		if ( !${updating} ) {
			${updateElement}
		}
	` );

	block.builders.destroy.addLine( deindent`
		${generator.helper( 'removeEventListener' )}( ${state.parentNode}, '${eventName}', ${handler} );
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

function getBindingValue ( generator, block, state, node, attribute, isMultipleSelect, bindingGroup, type ) {
	// <select multiple bind:value='selected>
	if ( isMultipleSelect ) {
		return `[].map.call( ${state.parentNode}.selectedOptions, function ( option ) { return option.__value; })`;
	}

	// <select bind:value='selected>
	if ( node.name === 'select' ) {
		return 'selectedOption && selectedOption.__value';
	}

	// <input type='checkbox' bind:group='foo'>
	if ( attribute.name === 'group' ) {
		if ( type === 'checkbox' ) {
			return `${generator.helper( 'getBindingGroupValue' )}( ${block.component}._bindingGroups[${bindingGroup}] )`;
		}

		return `${state.parentNode}.__value`;
	}

	// <input type='range|number' bind:value>
	if ( type === 'range' || type === 'number' ) {
		return `+${state.parentNode}.${attribute.name}`;
	}

	// everything else
	return `${state.parentNode}.${attribute.name}`;
}

function getBindingGroup ( generator, keypath ) {
	// TODO handle contextual bindings — `keypath` should include unique ID of
	// each block that provides context
	let index = generator.bindingGroups.indexOf( keypath );
	if ( index === -1 ) {
		index = generator.bindingGroups.length;
		generator.bindingGroups.push( keypath );
	}

	return index;
}
