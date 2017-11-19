import deindent from '../../../../utils/deindent';
import flattenReference from '../../../../utils/flattenReference';
import getStaticAttributeValue from '../../../../utils/getStaticAttributeValue';
import { DomGenerator } from '../../index';
import Block from '../../Block';
import { Node } from '../../../../interfaces';
import { State } from '../../interfaces';
import getObject from '../../../../utils/getObject';
import getTailSnippet from '../../../../utils/getTailSnippet';
import visitBinding from './Binding';
import { generateRule } from '../../../../shared/index';

const types: Record<string, (
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	binding: Node[]
) => void> = {
	input: addInputBinding,
	select: addSelectBinding,
	audio: addMediaBinding,
	video: addMediaBinding
};

const readOnlyMediaAttributes = new Set([
	'duration',
	'buffered',
	'seekable',
	'played'
]);

export default function addBindings(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node
) {
	const bindings: Node[] = node.attributes.filter((a: Node) => a.type === 'Binding');
	if (bindings.length === 0) return;

	types[node.name](generator, block, state, node, bindings);
}

function addInputBinding(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	bindings: Node[]
) {
	const attribute = bindings[0];

	const { name } = getObject(attribute.value);
	const { snippet, contexts, dependencies } = block.contextualise(
		attribute.value
	);

	contexts.forEach(context => {
		if (!~state.allUsedContexts.indexOf(context))
			state.allUsedContexts.push(context);
	});

	const type = getStaticAttributeValue(node, 'type');
	const eventName = type === 'radio' || type === 'checkbox' ? 'change' : 'input';

	const handler = block.getUniqueName(
		`${node.var}_${eventName}_handler`
	);

	const bindingGroup = attribute.name === 'group'
		? getBindingGroup(generator, attribute.value)
		: null;

	const value = (
		attribute.name === 'group' ?
			(type === 'checkbox' ? `@getBindingGroupValue(#component._bindingGroups[${bindingGroup}])` : `${node.var}.__value`) :
		(type === 'range' || type === 'number') ?
			`@toNumber(${node.var}.${attribute.name})` :
		`${node.var}.${attribute.name}`
	);

	let setter = getSetter(generator, block, name, snippet, node, attribute, dependencies, value);
	let updateElement = `${node.var}.${attribute.name} = ${snippet};`;

	const needsLock = !/radio|checkbox|range|color/.test(type); // TODO others?
	const lock = `#${node.var}_updating`;
	let updateConditions = needsLock ? [`!${lock}`] : [];

	if (needsLock) block.addVariable(lock, 'false');

	if (attribute.name === 'group') {
		// <input type='checkbox|radio' bind:group='selected'> special case
		if (type === 'radio') {
			setter = deindent`
				if (!${node.var}.checked) return;
				${setter}
			`;
		}

		const condition = type === 'checkbox'
			? `~${snippet}.indexOf(${node.var}.__value)`
			: `${node.var}.__value === ${snippet}`;

		block.builders.hydrate.addLine(
			`#component._bindingGroups[${bindingGroup}].push(${node.var});`
		);

		block.builders.destroy.addBlock(
			`#component._bindingGroups[${bindingGroup}].splice(#component._bindingGroups[${bindingGroup}].indexOf(${node.var}), 1);`
		);

		updateElement = `${node.var}.checked = ${condition};`;
	}

	block.builders.init.addBlock(deindent`
		function ${handler}() {
			${needsLock && `${lock} = true;`}
			${setter}
			${needsLock && `${lock} = false;`}
		}
	`);

	if (type === 'range') {
		// need to bind to `input` and `change`, for the benefit of IE
		block.builders.hydrate.addBlock(deindent`
			@addListener(${node.var}, "input", ${handler});
			@addListener(${node.var}, "change", ${handler});
		`);

		block.builders.destroy.addBlock(deindent`
			@removeListener(${node.var}, "input", ${handler});
			@removeListener(${node.var}, "change", ${handler});
		`);
	} else {
		block.builders.hydrate.addLine(
			`@addListener(${node.var}, "${eventName}", ${handler});`
		);

		block.builders.destroy.addLine(
			`@removeListener(${node.var}, "${eventName}", ${handler});`
		);
	}

	block.builders.update.addBlock(
		needsLock ?
			`if (!${lock}) ${updateElement}` :
			updateElement
	);

	node.initialUpdate = updateElement;
}

function addSelectBinding(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	bindings: Node[]
) {
	const attribute = bindings[0];

	const { name } = getObject(attribute.value);
	const { snippet, contexts, dependencies } = block.contextualise(
		attribute.value
	);

	contexts.forEach(context => {
		if (!~state.allUsedContexts.indexOf(context))
			state.allUsedContexts.push(context);
	});

	const lock = `#${node.var}_updating`;
	block.addVariable(lock, 'false');

	const handler = block.getUniqueName(
		`${node.var}_change_handler`
	);

	const isMultipleSelect = getStaticAttributeValue(node, 'multiple') === true;

	// view to model
	const value = isMultipleSelect ?
		`[].map.call(${node.var}.querySelectorAll(':checked'), function(option) { return option.__value; })` :
		`selectedOption && selectedOption.__value`;

	let setter = getSetter(generator, block, name, snippet, node, attribute, dependencies, value);

	if (!isMultipleSelect) {
		setter = deindent`
			var selectedOption = ${node.var}.querySelector(':checked') || ${node.var}.options[0];
			${setter}`;
	}

	generator.hasComplexBindings = true;
	block.builders.hydrate.addBlock(
		`if (!('${name}' in state)) #component._root._beforecreate.push(${handler});`
	);

	block.builders.init.addBlock(deindent`
		function ${handler}() {
			${lock} = true;
			${setter}
			${lock} = false;
		}
	`);

	block.builders.hydrate.addLine(
		`@addListener(${node.var}, "change", ${handler});`
	);

	block.builders.destroy.addLine(
		`@removeListener(${node.var}, "change", ${handler});`
	);

	// model to view
	const updateElement = isMultipleSelect ?
		`@selectOptions(${node.var}, ${snippet});` :
		`@selectOption(${node.var}, ${snippet});`;

	block.builders.update.addLine(
		`if (!${lock}) ${updateElement}`
	);

	node.initialUpdate = updateElement;
}

function addMediaBinding(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	bindings: Node[]
) {
	const attribute = bindings[0];

	const { name } = getObject(attribute.value);
	const { snippet, contexts, dependencies } = block.contextualise(
		attribute.value
	);

	contexts.forEach(context => {
		if (!~state.allUsedContexts.indexOf(context))
			state.allUsedContexts.push(context);
	});

	const eventNames = getBindingEventName(node, attribute);
	const handler = block.getUniqueName(
		`${node.var}_${eventNames.join('_')}_handler`
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

	const isMediaElement = node.name === 'audio' || node.name === 'video';
	const isReadOnly = isMediaElement && readOnlyMediaAttributes.has(attribute.name)

	const value = getBindingValue(
		generator,
		block,
		state,
		node,
		attribute,
		isMultipleSelect,
		isMediaElement,
		bindingGroup,
		type
	);

	let setter = getSetter(generator, block, name, snippet, node, attribute, dependencies, value);
	let updateElement = `${node.var}.${attribute.name} = ${snippet};`;

	const lock = `#${node.var}_updating`;
	let updateConditions = needsLock ? [`!${lock}`] : [];

	if (needsLock) block.addVariable(lock, 'false');

	// <select> special case
	if (node.name === 'select') {
		if (!isMultipleSelect) {
			setter = `var selectedOption = ${node.var}.querySelector(':checked') || ${node.var}.options[0];\n${setter}`;
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
			for (var #i = 0; #i < ${node.var}.options.length; #i += 1) {
				var ${option} = ${node.var}.options[#i];

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
				if (!${node.var}.checked) return;
				${setter}
			`;
		}

		const condition = type === 'checkbox'
			? `~${snippet}.indexOf(${node.var}.__value)`
			: `${node.var}.__value === ${snippet}`;

		block.builders.hydrate.addLine(
			`#component._bindingGroups[${bindingGroup}].push(${node.var});`
		);

		block.builders.destroy.addBlock(
			`#component._bindingGroups[${bindingGroup}].splice(#component._bindingGroups[${bindingGroup}].indexOf(${node.var}), 1);`
		);

		updateElement = `${node.var}.checked = ${condition};`;
	} else if (isMediaElement) {
		generator.hasComplexBindings = true;
		block.builders.hydrate.addBlock(`#component._root._beforecreate.push(${handler});`);

		if (attribute.name === 'currentTime') {
			const frame = block.getUniqueName(`${node.var}_animationframe`);
			block.addVariable(frame);
			setter = deindent`
				cancelAnimationFrame(${frame});
				if (!${node.var}.paused) ${frame} = requestAnimationFrame(${handler});
				${setter}
			`;

			updateConditions.push(`!isNaN(${snippet})`);
		} else if (attribute.name === 'paused') {
			// this is necessary to prevent the audio restarting by itself
			const last = block.getUniqueName(`${node.var}_paused_value`);
			block.addVariable(last, 'true');

			updateConditions = [`${last} !== (${last} = ${snippet})`];
			updateElement = `${node.var}[${last} ? "pause" : "play"]();`;
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
			@addListener(${node.var}, "input", ${handler});
			@addListener(${node.var}, "change", ${handler});
		`);

		block.builders.destroy.addBlock(deindent`
			@removeListener(${node.var}, "input", ${handler});
			@removeListener(${node.var}, "change", ${handler});
		`);
	} else {
		eventNames.forEach(eventName => {
			block.builders.hydrate.addLine(
				`@addListener(${node.var}, "${eventName}", ${handler});`
			);

			block.builders.destroy.addLine(
				`@removeListener(${node.var}, "${eventName}", ${handler});`
			);
		});
	}

	if (!isMediaElement) {
		node.initialUpdate = updateElement;
	}

	if (!isReadOnly) { // audio/video duration is read-only, it never updates
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
			`@addListener(${node.var}, "play", ${handler});`
		);
		block.builders.destroy.addLine(
			`@removeListener(${node.var}, "play", ${handler});`
		);
	}
}

function getBindingEventName(node: Node, attribute: Node) {
	if (node.name === 'input') {
		const typeAttribute = node.attributes.find(
			(attr: Node) => attr.type === 'Attribute' && attr.name === 'type'
		);
		const type = typeAttribute ? typeAttribute.value[0].data : 'text'; // TODO in validation, should throw if type attribute is not static

		return [type === 'checkbox' || type === 'radio' ? 'change' : 'input'];
	}

	if (node.name === 'textarea') return ['input'];
	if (attribute.name === 'currentTime') return ['timeupdate'];
	if (attribute.name === 'duration') return ['durationchange'];
	if (attribute.name === 'paused') return ['pause'];
	if (attribute.name === 'buffered') return ['progress', 'loadedmetadata'];
	if (attribute.name === 'seekable') return ['loadedmetadata'];
	if (attribute.name === 'played') return ['timeupdate'];

	return ['change'];
}

function getBindingValue(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	attribute: Node,
	isMultipleSelect: boolean,
	isMediaElement: boolean,
	bindingGroup: number,
	type: string
) {
	// <select multiple bind:value='selected>
	if (isMultipleSelect) {
		return `[].map.call(${node.var}.querySelectorAll(':checked'), function(option) { return option.__value; })`;
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

		return `${node.var}.__value`;
	}

	// <input type='range|number' bind:value>
	if (type === 'range' || type === 'number') {
		return `@toNumber(${node.var}.${attribute.name})`;
	}

	if (isMediaElement && (attribute.name === 'buffered' || attribute.name === 'seekable' || attribute.name === 'played')) {
		return `@timeRangesToArray(${node.var}.${attribute.name})`
	}

	// everything else
	return `${node.var}.${attribute.name}`;
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
	generator: DomGenerator,
	block: Block,
	name: string,
	snippet: string,
	node: Node,
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
			var list = ${node.var}._svelte.${block.listNames.get(name)};
			var index = ${node.var}._svelte.${block.indexNames.get(name)};
			${computed && `var state = #component.get();`}
			list[index]${tail} = ${value};

			${computed
				? `#component.set({${dependencies.map((prop: string) => `${prop}: state.${prop}`).join(', ')} });`
				: `#component.set({${dependencies.map((prop: string) => `${prop}: #component.get('${prop}')`).join(', ')} });`}
		`;
	}

	if (attribute.value.type === 'MemberExpression') {
		// This is a little confusing, and should probably be tidied up
		// at some point. It addresses a tricky bug (#893), wherein
		// Svelte tries to `set()` a computed property, which throws an
		// error in dev mode. a) it's possible that we should be
		// replacing computations with *their* dependencies, and b)
		// we should probably populate `generator.readonly` sooner so
		// that we don't have to do the `.some()` here
		dependencies = dependencies.filter(prop => !generator.computations.some(computation => computation.key === prop));

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
