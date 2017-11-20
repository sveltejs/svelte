import deindent from '../../../../utils/deindent';
import flattenReference from '../../../../utils/flattenReference';
import getStaticAttributeValue from '../../../../utils/getStaticAttributeValue';
import { DomGenerator } from '../../index';
import Block from '../../Block';
import { Node } from '../../../../interfaces';
import { State } from '../../interfaces';
import getObject from '../../../../utils/getObject';
import getTailSnippet from '../../../../utils/getTailSnippet';
import stringifyProps from '../../../../utils/stringifyProps';
import visitBinding from './Binding';
import { generateRule } from '../../../../shared/index';
import flatten from '../../../../utils/flattenReference';

interface Binding {
	name: string;
}

const readOnlyMediaAttributes = new Set([
	'duration',
	'buffered',
	'seekable',
	'played'
]);

function isMediaNode(node: Node) {
	return node.name === 'audio' || node.name === 'video';
}

const events = [
	{
		name: 'input',
		filter: (node: Node, binding: Binding) =>
			node.name === 'textarea' ||
			node.name === 'input' && !/radio|checkbox/.test(getStaticAttributeValue(node, 'type'))
	},
	{
		name: 'change',
		filter: (node: Node, binding: Binding) =>
			node.name === 'select' ||
			node.name === 'input' && /radio|checkbox|range/.test(getStaticAttributeValue(node, 'type'))
	},

	// media events
	{
		name: 'timeupdate',
		filter: (node: Node, binding: Binding) =>
			isMediaNode(node.name) &&
			(binding.name === 'currentTime' || binding.name === 'played')
	},
	{
		name: 'durationchange',
		filter: (node: Node, binding: Binding) =>
			isMediaNode(node.name) &&
			binding.name === 'duration'
	},
	{
		name: 'pause',
		filter: (node: Node, binding: Binding) =>
			isMediaNode(node.name) &&
			binding.name === 'paused'
	},
	{
		name: 'progress',
		filter: (node: Node, binding: Binding) =>
			isMediaNode(node.name) &&
			binding.name === 'buffered'
	},
	{
		name: 'loadedmetadata',
		filter: (node: Node, binding: Binding) =>
			isMediaNode(node.name) &&
			(binding.name === 'buffered' || binding.name === 'seekable')
	}
];

export default function addBindings(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node
) {
	const bindings: Node[] = node.attributes.filter((a: Node) => a.type === 'Binding');
	if (bindings.length === 0) return;

	if (node.name === 'select' || isMediaNode(node.name)) generator.hasComplexBindings = true;

	const mungedBindings = bindings.map(binding => {
		const needsLock = true; // TODO

		const { name } = getObject(binding.value);
		const { snippet, contexts, dependencies } = block.contextualise(
			binding.value
		);

		contexts.forEach(context => {
			if (!~state.allUsedContexts.indexOf(context))
				state.allUsedContexts.push(context);
		});

		// view to model
		// TODO tidy this up
		const valueFromDom = getBindingValue(
			generator,
			block,
			node._state,
			node,
			binding,
			node.name === 'select' && getStaticAttributeValue(node, 'multiple') === true,
			isMediaNode(node.name),
			binding.name === 'group' ? getBindingGroup(generator, binding.value) : null,
			getStaticAttributeValue(node, 'type')
		);

		const setter = getSetter(
			generator,
			block,
			name,
			snippet,
			node,
			binding,
			dependencies,
			valueFromDom
		);

		// model to view
		const update = getUpdater(node, binding, snippet);
		block.builders.update.addLine(update);

		// special cases
		if (binding.name === 'group') {
			const bindingGroup = getBindingGroup(generator, binding.value);

			block.builders.hydrate.addLine(
				`#component._bindingGroups[${bindingGroup}].push(${node.var});`
			);

			block.builders.destroy.addBlock(
				`#component._bindingGroups[${bindingGroup}].splice(#component._bindingGroups[${bindingGroup}].indexOf(${node.var}), 1);`
			);
		}

		return {
			name: binding.name,
			object: name,
			setter,
			update,
			needsLock
		};
	});

	const groups = events
		.map(event => {
			return {
				name: event.name,
				bindings: mungedBindings.filter(binding => event.filter(node, binding))
			};
		})
		.filter(group => group.bindings.length);

	groups.forEach(group => {
		const handler = block.getUniqueName(`${node.var}_${group.name}_handler`);

		const needsLock  = group.bindings.some(binding => binding.needsLock);

		const lock = needsLock ? block.getUniqueName(`${node.var}_updating`) : null;
		if (needsLock) block.addVariable(lock, 'false');

		const usesContext = group.bindings.some(binding => binding.setter.usesContext);
		const usesState = group.bindings.some(binding => binding.setter.usesState);
		const mutations = group.bindings.map(binding => binding.setter.mutation).filter(Boolean).join('\n');

		const updates = new Set();
		group.bindings.forEach(binding => {
			binding.setter.updates.forEach(update => {
				updates.add(update);
			});
		});

		const props = Array.from(updates).join(', '); // TODO use stringifyProps once indenting is fixed

		block.builders.init.addBlock(deindent`
			function ${handler}() {
				${usesContext && `var context = ${node.var}._svelte;`}
				${usesState && `var state = #component.get();`}
				${needsLock && `${lock} = true;`}
				${mutations.length > 0 && mutations}
				#component.set({ ${props} });
				${needsLock && `${lock} = false;`}
			}
		`);

		block.builders.hydrate.addLine(
			`@addListener(${node.var}, "${group.name}", ${handler});`
		);

		block.builders.destroy.addLine(
			`@removeListener(${node.var}, "${group.name}", ${handler});`
		);

		const allInitialStateIsDefined = group.bindings
			.map(binding => `'${binding.object}' in state`)
			.join(' && ');

		generator.hasComplexBindings = true;

		block.builders.hydrate.addBlock(
			`if (!(${allInitialStateIsDefined})) #component._root._beforecreate.push(${handler});`
		);
	});

	node.initialUpdate = mungedBindings.map(binding => binding.update).join('\n');
}

function getUpdater(
	node: Node,
	binding: Node,
	snippet: string
) {
	if (binding.name === 'group') {
		const type = getStaticAttributeValue(node, 'type');

		const condition = type === 'checkbox'
			? `~${snippet}.indexOf(${node.var}.__value)`
			: `${node.var}.__value === ${snippet}`;

		return `${node.var}.checked = ${condition};`
	}

	if (binding.name === 'checked') {

	}

	return `${node.var}.${binding.name} = ${snippet};`;
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
	if (block.contexts.has(name)) {
		const tail = attribute.value.type === 'MemberExpression'
			? getTailSnippet(attribute.value)
			: '';

		const list = `context.${block.listNames.get(name)}`;
		const index = `context.${block.indexNames.get(name)}`;

		return {
			usesContext: true,
			usesState: true,
			mutation: `${list}[${index}]${tail} = ${value};`,
			updates: dependencies.map(prop => `${prop}: state.${prop}`)
		};
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

		return {
			usesContext: false,
			usesState: true,
			mutation: `${snippet} = ${value}`,
			updates: dependencies.map((prop: string) => `${prop}: state.${prop}`)
		};
	}

	return {
		usesContext: false,
		usesState: false,
		mutation: null,
		updates: [`${name}: ${value}`]
	};
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
		return `@selectMultipleValue(${node.var})`;
		// return `[].map.call(${node.var}.querySelectorAll(':checked'), function(option) { return option.__value; })`;
	}

	// <select bind:value='selected>
	if (node.name === 'select') {
		// return 'selectedOption && selectedOption.__value';
		return `@selectValue(${node.var})`;
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

function isComputed(node: Node) {
	while (node.type === 'MemberExpression') {
		if (node.computed) return true;
		node = node.object;
	}

	return false;
}
