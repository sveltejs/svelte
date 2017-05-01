import deindent from '../../../../utils/deindent.js';
import flattenReference from '../../../../utils/flattenReference.js';
import getSetter from '../shared/binding/getSetter.js';
import getStaticAttributeValue from './getStaticAttributeValue.js';

export default function visitBinding ( generator, block, state, node, attribute ) {
	const { name, parts } = flattenReference( attribute.value );
	const { snippet, contexts, dependencies } = block.contextualise( attribute.value );

	if ( dependencies.length > 1 ) throw new Error( 'An unexpected situation arose. Please raise an issue at https://github.com/sveltejs/svelte/issues — thanks!' );

	contexts.forEach( context => {
		if ( !~state.allUsedContexts.indexOf( context ) ) state.allUsedContexts.push( context );
	});

	const eventName = getBindingEventName( node, attribute );
	const handler = block.getUniqueName( `${state.parentNode}_${eventName}_handler` );
	const isMultipleSelect = node.name === 'select' && node.attributes.find( attr => attr.name.toLowerCase() === 'multiple' ); // TODO use getStaticAttributeValue
	const type = getStaticAttributeValue( node, 'type' );
	const bindingGroup = attribute.name === 'group' ? getBindingGroup( generator, parts.join( '.' ) ) : null;
	const value = getBindingValue( generator, block, state, node, attribute, isMultipleSelect, bindingGroup, type );

	let setter = getSetter({ block, name, context: '_svelte', attribute, dependencies, value });
	let updateElement = `${state.parentNode}.${attribute.name} = ${snippet};`;
	const lock = block.alias( `${state.parentNode}_updating` );
	let updateCondition = `!${lock}`;

	block.addVariable( lock, 'false' );

	// <select> special case
	if ( node.name === 'select' ) {
		if ( !isMultipleSelect ) {
			setter = `var selectedOption = ${state.parentNode}.querySelector(':checked') || ${state.parentNode}.options[0];\n${setter}`;
		}

		const value = block.getUniqueName( 'value' );
		const i = block.alias( 'i' );
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

	else if ( node.name === 'audio' || node.name === 'video' ) {
		generator.hasComplexBindings = true;
		block.builders.create.addBlock( `${block.component}._bindings.push( ${handler} );` );

		if ( attribute.name === 'currentTime' ) {
			const frame = block.getUniqueName( `${state.parentNode}_animationframe` );
			block.addVariable( frame );
			setter = deindent`
				cancelAnimationFrame( ${frame} );
				if ( !${state.parentNode}.paused ) ${frame} = requestAnimationFrame( ${handler} );
				${setter}
			`;

			updateCondition += ` && !isNaN( ${snippet} )`;
		}

		else if ( attribute.name === 'duration' ) {
			updateCondition = null;
		}

		else if ( attribute.name === 'paused' ) {
			// this is necessary to prevent the audio restarting by itself
			const last = block.getUniqueName( `${state.parentNode}_paused_value` );
			block.addVariable( last, 'true' );

			updateCondition = `${last} !== ( ${last} = ${snippet} )`;
			updateElement = `${state.parentNode}[ ${last} ? 'pause' : 'play' ]();`;
		}
	}

	block.builders.create.addBlock( deindent`
		function ${handler} () {
			${lock} = true;
			${setter}
			${lock} = false;
		}

		${generator.helper( 'addEventListener' )}( ${state.parentNode}, '${eventName}', ${handler} );
	` );

	if ( node.name !== 'audio' && node.name !== 'video' ) node.initialUpdate = updateElement;

	if ( updateCondition !== null ) {
		// audio/video duration is read-only, it never updates
		block.builders.update.addBlock( deindent`
			if ( ${updateCondition} ) {
				${updateElement}
			}
		` );
	}

	block.builders.destroy.addLine( deindent`
		${generator.helper( 'removeEventListener' )}( ${state.parentNode}, '${eventName}', ${handler} );
	` );

	if ( attribute.name === 'paused' ) {
		block.builders.create.addLine( `${generator.helper( 'addEventListener' )}( ${state.parentNode}, 'play', ${handler} );` );
		block.builders.destroy.addLine( `${generator.helper( 'removeEventListener' )}( ${state.parentNode}, 'play', ${handler} );` );
	}
}

function getBindingEventName ( node, attribute ) {
	if ( node.name === 'input' ) {
		const typeAttribute = node.attributes.find( attr => attr.type === 'Attribute' && attr.name === 'type' );
		const type = typeAttribute ? typeAttribute.value[0].data : 'text'; // TODO in validation, should throw if type attribute is not static

		return type === 'checkbox' || type === 'radio' ? 'change' : 'input';
	}

	if ( node.name === 'textarea' ) return 'input';
	if ( attribute.name === 'currentTime' ) return 'timeupdate';
	if ( attribute.name === 'duration' ) return 'durationchange';
	if ( attribute.name === 'paused' ) return 'pause';

	return 'change';
}

function getBindingValue ( generator, block, state, node, attribute, isMultipleSelect, bindingGroup, type ) {
	// <select multiple bind:value='selected>
	if ( isMultipleSelect ) {
		return `[].map.call( ${state.parentNode}.querySelectorAll(':checked'), function ( option ) { return option.__value; })`;
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
