import deindent from '../../../../utils/deindent';
import flattenReference from '../../../../utils/flattenReference';
import getSetter from '../shared/binding/getSetter';
import getStaticAttributeValue from './getStaticAttributeValue';
import { DomGenerator } from '../../index';
import Block from '../../Block';
import { Node } from '../../../../interfaces';
import { State } from '../../interfaces';
import getObject from '../../../../utils/getObject';

export default function visitBinding(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	attribute: Node
) {
	const { name } = getObject(attribute.value);
	const { snippet, contexts, dependencies } = block.contextualise(attribute.value);

	contexts.forEach(context => {
		if (!~state.allUsedContexts.indexOf(context))
			state.allUsedContexts.push(context);
	});

	const eventName = getBindingEventName(node, attribute);
	const handler = block.getUniqueName(
		`${state.parentNode}_${eventName}_handler`
	);
	const isMultipleSelect =
		node.name === 'select' &&
		node.attributes.find(
			(attr: Node) => attr.name.toLowerCase() === 'multiple'
		); // TODO use getStaticAttributeValue
	const type = getStaticAttributeValue(node, 'type');
	const bindingGroup = attribute.name === 'group'
		? getBindingGroup(generator, attribute.value)
		: null;
	const value = getBindingValue(
		generator,
		block,
		state,
		node,
		attribute,
		isMultipleSelect,
		bindingGroup,
		type
	);

	let setter = getSetter({
		block,
		name,
		snippet,
		context: '_svelte',
		attribute,
		dependencies,
		value,
	});
	let updateElement = `${state.parentNode}.${attribute.name} = ${snippet};`;
	const lock = block.alias(`${state.parentNode}_updating`);
	let updateCondition = `!${lock}`;

	block.addVariable(lock, 'false');

	// <select> special case
	if (node.name === 'select') {
		if (!isMultipleSelect) {
			setter = `var selectedOption = ${state.parentNode}.querySelector(':checked') || ${state.parentNode}.options[0];\n${setter}`;
		}

		const value = block.getUniqueName('value');
		const i = block.alias('i');
		const option = block.getUniqueName('option');

		const ifStatement = isMultipleSelect
			? deindent`
				${option}.selected = ~${value}.indexOf( ${option}.__value );`
			: deindent`
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

		generator.hasComplexBindings = true;
		block.builders.hydrate.addBlock(
			`if ( !('${name}' in state) ) ${block.component}._bindings.push( ${handler} );`
		);
	} else if (attribute.name === 'group') {
		// <input type='checkbox|radio' bind:group='selected'> special case
		if (type === 'radio') {
			setter = deindent`
				if ( !${state.parentNode}.checked ) return;
				${setter}
			`;
		}

		const condition = type === 'checkbox'
			? `~${snippet}.indexOf( ${state.parentNode}.__value )`
			: `${state.parentNode}.__value === ${snippet}`;

		block.builders.hydrate.addLine(
			`${block.component}._bindingGroups[${bindingGroup}].push( ${state.parentNode} );`
		);

		block.builders.destroy.addBlock(
			`${block.component}._bindingGroups[${bindingGroup}].splice( ${block.component}._bindingGroups[${bindingGroup}].indexOf( ${state.parentNode} ), 1 );`
		);

		updateElement = `${state.parentNode}.checked = ${condition};`;
	} else if (node.name === 'audio' || node.name === 'video') {
		generator.hasComplexBindings = true;
		block.builders.hydrate.addBlock(
			`${block.component}._bindings.push( ${handler} );`
		);

		if (attribute.name === 'currentTime') {
			const frame = block.getUniqueName(`${state.parentNode}_animationframe`);
			block.addVariable(frame);
			setter = deindent`
				cancelAnimationFrame( ${frame} );
				if ( !${state.parentNode}.paused ) ${frame} = requestAnimationFrame( ${handler} );
				${setter}
			`;

			updateCondition += ` && !isNaN( ${snippet} )`;
		} else if (attribute.name === 'duration') {
			updateCondition = null;
		} else if (attribute.name === 'paused') {
			// this is necessary to prevent the audio restarting by itself
			const last = block.getUniqueName(`${state.parentNode}_paused_value`);
			block.addVariable(last, 'true');

			updateCondition = `${last} !== ( ${last} = ${snippet} )`;
			updateElement = `${state.parentNode}[ ${last} ? 'pause' : 'play' ]();`;
		}
	}

	block.builders.init.addBlock(deindent`
		function ${handler} () {
			${lock} = true;
			${setter}
			${lock} = false;
		}
	`);

	block.builders.hydrate.addBlock(deindent`
		${generator.helper(
			'addListener'
		)}( ${state.parentNode}, '${eventName}', ${handler} );
	`);

	if (node.name !== 'audio' && node.name !== 'video')
		node.initialUpdate = updateElement;

	if (updateCondition !== null) {
		// audio/video duration is read-only, it never updates
		block.builders.update.addBlock(deindent`
			if ( ${updateCondition} ) {
				${updateElement}
			}
		`);
	}

	block.builders.destroy.addLine(deindent`
		${generator.helper(
			'removeListener'
		)}( ${state.parentNode}, '${eventName}', ${handler} );
	`);

	if (attribute.name === 'paused') {
		block.builders.create.addLine(
			`${generator.helper(
				'addListener'
			)}( ${state.parentNode}, 'play', ${handler} );`
		);
		block.builders.destroy.addLine(
			`${generator.helper(
				'removeListener'
			)}( ${state.parentNode}, 'play', ${handler} );`
		);
	}
}

function getBindingEventName(node: Node, attribute: Node) {
	if (node.name === 'input') {
		const typeAttribute = node.attributes.find(
			(attr: Node) => attr.type === 'Attribute' && attr.name === 'type'
		);
		const type = typeAttribute ? typeAttribute.value[0].data : 'text'; // TODO in validation, should throw if type attribute is not static

		return type === 'checkbox' || type === 'radio' ? 'change' : 'input';
	}

	if (node.name === 'textarea') return 'input';
	if (attribute.name === 'currentTime') return 'timeupdate';
	if (attribute.name === 'duration') return 'durationchange';
	if (attribute.name === 'paused') return 'pause';

	return 'change';
}

function getBindingValue(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	attribute: Node,
	isMultipleSelect: boolean,
	bindingGroup: number,
	type: string
) {
	// <select multiple bind:value='selected>
	if (isMultipleSelect) {
		return `[].map.call( ${state.parentNode}.querySelectorAll(':checked'), function ( option ) { return option.__value; })`;
	}

	// <select bind:value='selected>
	if (node.name === 'select') {
		return 'selectedOption && selectedOption.__value';
	}

	// <input type='checkbox' bind:group='foo'>
	if (attribute.name === 'group') {
		if (type === 'checkbox') {
			return `${generator.helper(
				'getBindingGroupValue'
			)}( ${block.component}._bindingGroups[${bindingGroup}] )`;
		}

		return `${state.parentNode}.__value`;
	}

	// <input type='range|number' bind:value>
	if (type === 'range' || type === 'number') {
		return `${generator.helper(
			'toNumber'
		)}( ${state.parentNode}.${attribute.name} )`;
	}

	// everything else
	return `${state.parentNode}.${attribute.name}`;
}

function getBindingGroup(generator: DomGenerator, value: Node) {
	const { parts } = flattenReference(value); // TODO handle cases involving computed member expressions
	const keypath = parts.join('.');

	// TODO handle contextual bindings — `keypath` should include unique ID of
	// each block that provides context
	let index = generator.bindingGroups.indexOf(keypath);
	if (index === -1) {
		index = generator.bindingGroups.length;
		generator.bindingGroups.push(keypath);
	}

	return index;
}
