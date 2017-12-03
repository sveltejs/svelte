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

function isMediaNode(name: string) {
	return name === 'audio' || name === 'video';
}

const events = [
	{
		eventNames: ['input'],
		filter: (node: Node, binding: Binding) =>
			node.name === 'textarea' ||
			node.name === 'input' && !/radio|checkbox/.test(getStaticAttributeValue(node, 'type'))
	},
	{
		eventNames: ['change'],
		filter: (node: Node, binding: Binding) =>
			node.name === 'select' ||
			node.name === 'input' && /radio|checkbox|range/.test(getStaticAttributeValue(node, 'type'))
	},

	// media events
	{
		eventNames: ['timeupdate'],
		filter: (node: Node, binding: Binding) =>
			isMediaNode(node.name) &&
			(binding.name === 'currentTime' || binding.name === 'played')
	},
	{
		eventNames: ['durationchange'],
		filter: (node: Node, binding: Binding) =>
			isMediaNode(node.name) &&
			binding.name === 'duration'
	},
	{
		eventNames: ['play', 'pause'],
		filter: (node: Node, binding: Binding) =>
			isMediaNode(node.name) &&
			binding.name === 'paused'
	},
	{
		eventNames: ['progress'],
		filter: (node: Node, binding: Binding) =>
			isMediaNode(node.name) &&
			binding.name === 'buffered'
	},
	{
		eventNames: ['loadedmetadata'],
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

	const needsLock = node.name !== 'input' || !/radio|checkbox|range|color/.test(getStaticAttributeValue(node, 'type'));

	const mungedBindings = bindings.map(binding => {
		const isReadOnly = isMediaNode(node.name) && readOnlyMediaAttributes.has(binding.name);

		let updateCondition: string;

		const { name } = getObject(binding.value);
		const { contexts } = block.contextualise(binding.value);
		const { snippet } = binding.metadata;

		// special case: if you have e.g. `<input type=checkbox bind:checked=selected.done>`
		// and `selected` is an object chosen with a <select>, then when `checked` changes,
		// we need to tell the component to update all the values `selected` might be
		// pointing to
		// TODO should this happen in preprocess?
		const dependencies = binding.metadata.dependencies.slice();
		binding.metadata.dependencies.forEach((prop: string) => {
			const indirectDependencies = generator.indirectDependencies.get(prop);
			if (indirectDependencies) {
				indirectDependencies.forEach(indirectDependency => {
					if (!~dependencies.indexOf(indirectDependency)) dependencies.push(indirectDependency);
				});
			}
		});

		contexts.forEach(context => {
			if (!~state.allUsedContexts.indexOf(context))
				state.allUsedContexts.push(context);
		});

		// view to model
		const valueFromDom = getValueFromDom(generator, node, binding);
		const handler = getEventHandler(generator, block, name, snippet, binding, dependencies, valueFromDom);

		// model to view
		let updateDom = getDomUpdater(node, binding, snippet);
		let initialUpdate = updateDom;

		// special cases
		if (binding.name === 'group') {
			const bindingGroup = getBindingGroup(generator, binding.value);

			block.builders.hydrate.addLine(
				`#component._bindingGroups[${bindingGroup}].push(${node.var});`
			);

			block.builders.destroy.addLine(
				`#component._bindingGroups[${bindingGroup}].splice(#component._bindingGroups[${bindingGroup}].indexOf(${node.var}), 1);`
			);
		}

		if (binding.name === 'currentTime') {
			updateCondition = `!isNaN(${snippet})`;
			initialUpdate = null;
		}

		if (binding.name === 'paused') {
			// this is necessary to prevent audio restarting by itself
			const last = block.getUniqueName(`${node.var}_is_paused`);
			block.addVariable(last, 'true');

			updateCondition = `${last} !== (${last} = ${snippet})`;
			updateDom = `${node.var}[${last} ? "pause" : "play"]();`;
			initialUpdate = null;
		}

		return {
			name: binding.name,
			object: name,
			handler,
			updateDom,
			initialUpdate,
			needsLock: !isReadOnly && needsLock,
			updateCondition
		};
	});

	const lock = mungedBindings.some(binding => binding.needsLock) ?
		block.getUniqueName(`${node.var}_updating`) :
		null;

	if (lock) block.addVariable(lock, 'false');

	const groups = events
		.map(event => {
			return {
				events: event.eventNames,
				bindings: mungedBindings.filter(binding => event.filter(node, binding))
			};
		})
		.filter(group => group.bindings.length);

	groups.forEach(group => {
		const handler = block.getUniqueName(`${node.var}_${group.events.join('_')}_handler`);

		const needsLock = group.bindings.some(binding => binding.needsLock);

		group.bindings.forEach(binding => {
			if (!binding.updateDom) return;

			const updateConditions = needsLock ? [`!${lock}`] : [];
			if (binding.updateCondition) updateConditions.push(binding.updateCondition);

			block.builders.update.addLine(
				updateConditions.length ? `if (${updateConditions.join(' && ')}) ${binding.updateDom}` : binding.updateDom
			);
		});

		const usesContext = group.bindings.some(binding => binding.handler.usesContext);
		const usesState = group.bindings.some(binding => binding.handler.usesState);
		const usesStore = group.bindings.some(binding => binding.handler.usesStore);
		const mutations = group.bindings.map(binding => binding.handler.mutation).filter(Boolean).join('\n');

		const props = new Set();
		const storeProps = new Set();
		group.bindings.forEach(binding => {
			binding.handler.props.forEach(prop => {
				props.add(prop);
			});

			binding.handler.storeProps.forEach(prop => {
				storeProps.add(prop);
			});
		}); // TODO use stringifyProps here, once indenting is fixed

		// media bindings — awkward special case. The native timeupdate events
		// fire too infrequently, so we need to take matters into our
		// own hands
		let animation_frame;
		if (group.events[0] === 'timeupdate') {
			animation_frame = block.getUniqueName(`${node.var}_animationframe`);
			block.addVariable(animation_frame);
		}

		block.builders.init.addBlock(deindent`
			function ${handler}() {
				${
					animation_frame && deindent`
						cancelAnimationFrame(${animation_frame});
						if (!${node.var}.paused) ${animation_frame} = requestAnimationFrame(${handler});`
				}
				${usesContext && `var context = ${node.var}._svelte;`}
				${usesState && `var state = #component.get();`}
				${usesStore && `var $ = #component.store.get();`}
				${needsLock && `${lock} = true;`}
				${mutations.length > 0 && mutations}
				${props.size > 0 && `#component.set({ ${Array.from(props).join(', ')} });`}
				${storeProps.size > 0 && `#component.store.set({ ${Array.from(storeProps).join(', ')} });`}
				${needsLock && `${lock} = false;`}
			}
		`);

		group.events.forEach(name => {
			block.builders.hydrate.addLine(
				`@addListener(${node.var}, "${name}", ${handler});`
			);

			block.builders.destroy.addLine(
				`@removeListener(${node.var}, "${name}", ${handler});`
			);
		});

		const allInitialStateIsDefined = group.bindings
			.map(binding => `'${binding.object}' in state`)
			.join(' && ');

		if (node.name === 'select' || group.bindings.find(binding => binding.name === 'indeterminate' || readOnlyMediaAttributes.has(binding.name))) {
			generator.hasComplexBindings = true;

			block.builders.hydrate.addLine(
				`if (!(${allInitialStateIsDefined})) #component._root._beforecreate.push(${handler});`
			);
		}
	});

	node.initialUpdate = mungedBindings.map(binding => binding.initialUpdate).filter(Boolean).join('\n');
}

function getDomUpdater(
	node: Node,
	binding: Node,
	snippet: string
) {
	if (readOnlyMediaAttributes.has(binding.name)) {
		return null;
	}

	if (node.name === 'select') {
		return getStaticAttributeValue(node, 'multiple') === true ?
			`@selectOptions(${node.var}, ${snippet})` :
			`@selectOption(${node.var}, ${snippet})`;
	}

	if (binding.name === 'group') {
		const type = getStaticAttributeValue(node, 'type');

		const condition = type === 'checkbox'
			? `~${snippet}.indexOf(${node.var}.__value)`
			: `${node.var}.__value === ${snippet}`;

		return `${node.var}.checked = ${condition};`
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

function getEventHandler(
	generator: DomGenerator,
	block: Block,
	name: string,
	snippet: string,
	attribute: Node,
	dependencies: string[],
	value: string,
) {
	let storeDependencies = [];

	if (generator.options.store) {
		storeDependencies = dependencies.filter(prop => prop[0] === '$').map(prop => prop.slice(1));
		dependencies = dependencies.filter(prop => prop[0] !== '$');
	}

	if (block.contexts.has(name)) {
		const tail = attribute.value.type === 'MemberExpression'
			? getTailSnippet(attribute.value)
			: '';

		const list = `context.${block.listNames.get(name)}`;
		const index = `context.${block.indexNames.get(name)}`;

		return {
			usesContext: true,
			usesState: true,
			usesStore: storeDependencies.length > 0,
			mutation: `${list}[${index}]${tail} = ${value};`,
			props: dependencies.map(prop => `${prop}: state.${prop}`),
			storeProps: storeDependencies.map(prop => `${prop}: $.${prop}`)
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
			usesStore: storeDependencies.length > 0,
			mutation: `${snippet} = ${value}`,
			props: dependencies.map((prop: string) => `${prop}: state.${prop}`),
			storeProps: storeDependencies.map(prop => `${prop}: $.${prop}`)
		};
	}

	let props;
	let storeProps;

	if (generator.options.store && name[0] === '$') {
		props = [];
		storeProps = [`${name.slice(1)}: ${value}`];
	} else {
		props = [`${name}: ${value}`];
		storeProps = [];
	}

	return {
		usesContext: false,
		usesState: false,
		usesStore: false,
		mutation: null,
		props,
		storeProps
	};
}

function getValueFromDom(
	generator: DomGenerator,
	node: Node,
	binding: Node
) {
	// <select bind:value='selected>
	if (node.name === 'select') {
		return getStaticAttributeValue(node, 'multiple') === true ?
			`@selectMultipleValue(${node.var})` :
			`@selectValue(${node.var})`;
	}

	const type = getStaticAttributeValue(node, 'type');

	// <input type='checkbox' bind:group='foo'>
	if (binding.name === 'group') {
		const bindingGroup = getBindingGroup(generator, binding.value);
		if (type === 'checkbox') {
			return `@getBindingGroupValue(#component._bindingGroups[${bindingGroup}])`;
		}

		return `${node.var}.__value`;
	}

	// <input type='range|number' bind:value>
	if (type === 'range' || type === 'number') {
		return `@toNumber(${node.var}.${binding.name})`;
	}

	if ((binding.name === 'buffered' || binding.name === 'seekable' || binding.name === 'played')) {
		return `@timeRangesToArray(${node.var}.${binding.name})`
	}

	// everything else
	return `${node.var}.${binding.name}`;
}

function isComputed(node: Node) {
	while (node.type === 'MemberExpression') {
		if (node.computed) return true;
		node = node.object;
	}

	return false;
}