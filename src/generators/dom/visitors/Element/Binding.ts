import deindent from '../../../../utils/deindent';
import flattenReference from '../../../../utils/flattenReference';
import getStaticAttributeValue from '../../../shared/getStaticAttributeValue';
import { DomGenerator } from '../../index';
import Block from '../../Block';
import { Node } from '../../../../interfaces';
import { State } from '../../interfaces';
import getObject from '../../../../utils/getObject';
import getTailSnippet from '../../../../utils/getTailSnippet';

export default function visitBinding(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	attribute: Node
) {
	const { name } = getObject(attribute.value);
	const { snippet, contexts, dependencies } = block.contextualise(
		attribute.value
	);

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

	let setter = getSetter(block, name, snippet, state.parentNode, attribute, dependencies, value);
	let updateElement = `${state.parentNode}.${attribute.name} = ${snippet};`;

	const needsLock = node.name !== 'input' || !/radio|checkbox|range|color/.test(type); // TODO others?
	const lock = `#${state.parentNode}_updating`;
	let updateConditions = needsLock ? [`!${lock}`] : [];
	let readOnly = false;

	if (needsLock) block.addVariable(lock, 'false');

	// <select> special case
	if (node.name === 'select') {
		if (!isMultipleSelect) {
			setter = `var selectedOption = ${state.parentNode}.querySelector(':checked') || ${state.parentNode}.options[0];\n${setter}`;
		}

		const value = block.getUniqueName('value');
		const option = block.getUniqueName('option');

		const ifStatement = isMultipleSelect
			? deindent`
				${option}.selected = ~${value}.indexOf(${option}.__value);`
			: deindent`
				if (${option}.__value === ${value}) {
					${option}.selected = true;
					break;
				}`;

		const { name } = getObject(attribute.value);
		const tailSnippet = getTailSnippet(attribute.value);

		updateElement = deindent`
			var ${value} = ${snippet};
			for (var #i = 0; #i < ${state.parentNode}.options.length; #i += 1) {
				var ${option} = ${state.parentNode}.options[#i];

				${ifStatement}
			}
		`;

		generator.hasComplexBindings = true;
		block.builders.hydrate.addBlock(
			`if (!('${name}' in state)) #component._root._beforecreate.push(${handler});`
		);
	} else if (attribute.name === 'group') {
		// <input type='checkbox|radio' bind:group='selected'> special case
		if (type === 'radio') {
			setter = deindent`
				if (!${state.parentNode}.checked) return;
				${setter}
			`;
		}

		const condition = type === 'checkbox'
			? `~${snippet}.indexOf(${state.parentNode}.__value)`
			: `${state.parentNode}.__value === ${snippet}`;

		block.builders.hydrate.addLine(
			`#component._bindingGroups[${bindingGroup}].push(${state.parentNode});`
		);

		block.builders.destroy.addBlock(
			`#component._bindingGroups[${bindingGroup}].splice(#component._bindingGroups[${bindingGroup}].indexOf(${state.parentNode}), 1);`
		);

		updateElement = `${state.parentNode}.checked = ${condition};`;
	} else if (node.name === 'audio' || node.name === 'video') {
		generator.hasComplexBindings = true;
		block.builders.hydrate.addBlock(`#component._root._beforecreate.push(${handler});`);

		if (attribute.name === 'currentTime') {
			const frame = block.getUniqueName(`${state.parentNode}_animationframe`);
			block.addVariable(frame);
			setter = deindent`
				cancelAnimationFrame(${frame});
				if (!${state.parentNode}.paused) ${frame} = requestAnimationFrame(${handler});
				${setter}
			`;

			updateConditions.push(`!isNaN(${snippet})`);
		} else if (attribute.name === 'duration') {
			readOnly = true;
		} else if (attribute.name === 'paused') {
			// this is necessary to prevent the audio restarting by itself
			const last = block.getUniqueName(`${state.parentNode}_paused_value`);
			block.addVariable(last, 'true');

			updateConditions = [`${last} !== (${last} = ${snippet})`];
			updateElement = `${state.parentNode}[${last} ? "pause" : "play"]();`;
		}
	}

	block.builders.init.addBlock(deindent`
		function ${handler}() {
			${needsLock && `${lock} = true;`}
			${setter}
			${needsLock && `${lock} = false;`}
		}
	`);

	if (node.name === 'input' && type === 'range') {
		// need to bind to `input` and `change`, for the benefit of IE
		block.builders.hydrate.addBlock(deindent`
			@addListener(${state.parentNode}, "input", ${handler});
			@addListener(${state.parentNode}, "change", ${handler});
		`);

		block.builders.destroy.addBlock(deindent`
			@removeListener(${state.parentNode}, "input", ${handler});
			@removeListener(${state.parentNode}, "change", ${handler});
		`);
	} else {
		block.builders.hydrate.addLine(
			`@addListener(${state.parentNode}, "${eventName}", ${handler});`
		);

		block.builders.destroy.addLine(
			`@removeListener(${state.parentNode}, "${eventName}", ${handler});`
		);
	}

	if (node.name !== 'audio' && node.name !== 'video') {
		node.initialUpdate = updateElement;
		node.initialUpdateNeedsStateObject = !block.contexts.has(name);
	}

	if (!readOnly) { // audio/video duration is read-only, it never updates
		if (updateConditions.length) {
			block.builders.update.addBlock(deindent`
				if (${updateConditions.join(' && ')}) {
					${updateElement}
				}
			`);
		} else {
			block.builders.update.addBlock(deindent`
				${updateElement}
			`);
		}
	}

	if (attribute.name === 'paused') {
		block.builders.create.addLine(
			`@addListener(${state.parentNode}, "play", ${handler});`
		);
		block.builders.destroy.addLine(
			`@removeListener(${state.parentNode}, "play", ${handler});`
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
		return `[].map.call(${state.parentNode}.querySelectorAll(':checked'), function(option) { return option.__value; })`;
	}

	// <select bind:value='selected>
	if (node.name === 'select') {
		return 'selectedOption && selectedOption.__value';
	}

	// <input type='checkbox' bind:group='foo'>
	if (attribute.name === 'group') {
		if (type === 'checkbox') {
			return `@getBindingGroupValue(#component._bindingGroups[${bindingGroup}])`;
		}

		return `${state.parentNode}.__value`;
	}

	// <input type='range|number' bind:value>
	if (type === 'range' || type === 'number') {
		return `@toNumber(${state.parentNode}.${attribute.name})`;
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

function getSetter(
	block: Block,
	name: string,
	snippet: string,
	_this: string,
	attribute: Node,
	dependencies: string[],
	value: string,
) {
	const tail = attribute.value.type === 'MemberExpression'
		? getTailSnippet(attribute.value)
		: '';

	if (block.contexts.has(name)) {
		const prop = dependencies[0];
		const computed = isComputed(attribute.value);

		return deindent`
			var list = ${_this}._svelte.${block.listNames.get(name)};
			var index = ${_this}._svelte.${block.indexNames.get(name)};
			${computed && `var state = #component.get();`}
			list[index]${tail} = ${value};

			${computed
				? `#component.set({${dependencies.map((prop: string) => `${prop}: state.${prop}`).join(', ')} });`
				: `#component.set({${dependencies.map((prop: string) => `${prop}: #component.get('${prop}')`).join(', ')} });`}
		`;
	}

	if (attribute.value.type === 'MemberExpression') {
		return deindent`
			var state = #component.get();
			${snippet} = ${value};
			#component.set({ ${dependencies.map((prop: string) => `${prop}: state.${prop}`).join(', ')} });
		`;
	}

	return `#component.set({ ${name}: ${value} });`;
}

function isComputed(node: Node) {
	while (node.type === 'MemberExpression') {
		if (node.computed) return true;
		node = node.object;
	}

	return false;
}