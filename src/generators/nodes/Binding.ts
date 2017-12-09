import Node from './shared/Node';
import Element from './Element';
import getObject from '../../utils/getObject';
import getTailSnippet from '../../utils/getTailSnippet';
import flattenReference from '../../utils/flattenReference';
import { DomGenerator } from '../dom/index';
import Block from '../dom/Block';

const readOnlyMediaAttributes = new Set([
	'duration',
	'buffered',
	'seekable',
	'played'
]);

export default class Binding extends Node {
	name: string;
	value: Node;
	expression: Node;

	munge(
		block: Block,
		allUsedContexts: Set<string>
	) {
		const node: Element = this.parent;

		const needsLock = node.name !== 'input' || !/radio|checkbox|range|color/.test(node.getStaticAttributeValue('type'));
		const isReadOnly = node.isMediaNode() && readOnlyMediaAttributes.has(this.name);

		let updateCondition: string;

		const { name } = getObject(this.value);
		const { contexts } = block.contextualise(this.value);
		const { snippet } = this.metadata;

		// special case: if you have e.g. `<input type=checkbox bind:checked=selected.done>`
		// and `selected` is an object chosen with a <select>, then when `checked` changes,
		// we need to tell the component to update all the values `selected` might be
		// pointing to
		// TODO should this happen in preprocess?
		const dependencies = this.metadata.dependencies.slice();
		this.metadata.dependencies.forEach((prop: string) => {
			const indirectDependencies = this.generator.indirectDependencies.get(prop);
			if (indirectDependencies) {
				indirectDependencies.forEach(indirectDependency => {
					if (!~dependencies.indexOf(indirectDependency)) dependencies.push(indirectDependency);
				});
			}
		});

		contexts.forEach(context => {
			allUsedContexts.add(context);
		});

		// view to model
		const valueFromDom = getValueFromDom(this.generator, node, this);
		const handler = getEventHandler(this.generator, block, name, snippet, this, dependencies, valueFromDom);

		// model to view
		let updateDom = getDomUpdater(node, this, snippet);
		let initialUpdate = updateDom;

		// special cases
		if (this.name === 'group') {
			const bindingGroup = getBindingGroup(this.generator, this.value);

			block.builders.hydrate.addLine(
				`#component._bindingGroups[${bindingGroup}].push(${node.var});`
			);

			block.builders.destroy.addLine(
				`#component._bindingGroups[${bindingGroup}].splice(#component._bindingGroups[${bindingGroup}].indexOf(${node.var}), 1);`
			);
		}

		if (this.name === 'currentTime') {
			updateCondition = `!isNaN(${snippet})`;
			initialUpdate = null;
		}

		if (this.name === 'paused') {
			// this is necessary to prevent audio restarting by itself
			const last = block.getUniqueName(`${node.var}_is_paused`);
			block.addVariable(last, 'true');

			updateCondition = `${last} !== (${last} = ${snippet})`;
			updateDom = `${node.var}[${last} ? "pause" : "play"]();`;
			initialUpdate = null;
		}

		return {
			name: this.name,
			object: name,
			handler,
			updateDom,
			initialUpdate,
			needsLock: !isReadOnly && needsLock,
			updateCondition,
			isReadOnlyMediaAttribute: this.isReadOnlyMediaAttribute()
		};
	}

	isReadOnlyMediaAttribute() {
		return readOnlyMediaAttributes.has(this.name);
	}
}

function getDomUpdater(
	node: Element,
	binding: Binding,
	snippet: string
) {
	if (binding.isReadOnlyMediaAttribute()) {
		return null;
	}

	if (node.name === 'select') {
		return node.getStaticAttributeValue('multiple') === true ?
			`@selectOptions(${node.var}, ${snippet})` :
			`@selectOption(${node.var}, ${snippet})`;
	}

	if (binding.name === 'group') {
		const type = node.getStaticAttributeValue('type');

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
	node: Element,
	binding: Node
) {
	// <select bind:value='selected>
	if (node.name === 'select') {
		return node.getStaticAttributeValue('multiple') === true ?
			`@selectMultipleValue(${node.var})` :
			`@selectValue(${node.var})`;
	}

	const type = node.getStaticAttributeValue('type');

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