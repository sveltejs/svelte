import Binding from '../../../nodes/Binding';
import ElementWrapper from '.';
import { dimensions } from '../../../../utils/patterns';
import getObject from '../../../../utils/getObject';
import Block from '../../Block';

type Handler = {

}

const readOnlyMediaAttributes = new Set([
	'duration',
	'buffered',
	'seekable',
	'played'
]);

export default class BindingWrapper {
	node: Binding;
	parent: ElementWrapper;

	object: string;
	handler: Handler;
	updateDom: string;
	initialUpdate: string;
	needsLock: boolean;
	updateCondition: string;
	isReadOnlyMediaAttribute: boolean;

	constructor(node: Binding, parent: ElementWrapper) {
		this.node = node;
		this.parent = parent;

		parent.cannotUseInnerHTML();

		const needsLock = (
			parent.node.name !== 'input' ||
			!/radio|checkbox|range|color/.test(parent.getStaticAttributeValue('type'))
		);

		const isReadOnly = (
			(parent.isMediaNode() && readOnlyMediaAttributes.has(this.node.name)) ||
			dimensions.test(this.node.name)
		);

		let updateConditions: string[] = [];

		const { name } = getObject(this.node.value.node);
		const { snippet } = this.node.value;

		// special case: if you have e.g. `<input type=checkbox bind:checked=selected.done>`
		// and `selected` is an object chosen with a <select>, then when `checked` changes,
		// we need to tell the component to update all the values `selected` might be
		// pointing to
		// TODO should this happen in preprocess?
		const dependencies = new Set(this.node.value.dependencies);
		this.node.value.dependencies.forEach((prop: string) => {
			const indirectDependencies = parent.renderer.component.indirectDependencies.get(prop);
			if (indirectDependencies) {
				indirectDependencies.forEach(indirectDependency => {
					dependencies.add(indirectDependency);
				});
			}
		});

		// view to model
		const valueFromDom = getValueFromDom(this.component, parent.node, this);
		const handler = getEventHandler(this, this.component, block, name, snippet, dependencies, valueFromDom);

		// model to view
		let updateDom = getDomUpdater(node, this, snippet);
		let initialUpdate = updateDom;

		// special cases
		if (this.node.name === 'group') {
			const bindingGroup = getBindingGroup(this.component, this.value.node);

			block.builders.hydrate.addLine(
				`#component._bindingGroups[${bindingGroup}].push(${node.var});`
			);

			block.builders.destroy.addLine(
				`#component._bindingGroups[${bindingGroup}].splice(#component._bindingGroups[${bindingGroup}].indexOf(${node.var}), 1);`
			);
		}

		if (this.node.name === 'currentTime' || this.node.name === 'volume') {
			updateConditions.push(`!isNaN(${snippet})`);

			if (this.node.name === 'currentTime') initialUpdate = null;
		}

		if (this.node.name === 'paused') {
			// this is necessary to prevent audio restarting by itself
			const last = block.getUniqueName(`${node.var}_is_paused`);
			block.addVariable(last, 'true');

			updateConditions.push(`${last} !== (${last} = ${snippet})`);
			updateDom = `${node.var}[${last} ? "pause" : "play"]();`;
			initialUpdate = null;
		}

		// bind:offsetWidth and bind:offsetHeight
		if (dimensions.test(this.node.name)) {
			initialUpdate = null;
			updateDom = null;
		}

		const dependencyArray = [...this.value.dependencies]

		if (dependencyArray.length === 1) {
			updateConditions.push(`changed.${dependencyArray[0]}`)
		} else if (dependencyArray.length > 1) {
			updateConditions.push(
				`(${dependencyArray.map(prop => `changed.${prop}`).join(' || ')})`
			)
		}

		this.object = name;
		this.handler = handler;
		this.updateDom = updateDom;
		this.initialUpdate = initialUpdate;
		this.needsLock = !isReadOnly && needsLock;
		this.updateCondition = updateConditions.length ? updateConditions.join(' && ') : undefined;
		this.isReadOnlyMediaAttribute = readOnlyMediaAttributes.has(this.node.name);
	}

	render(block: Block) {

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

function getBindingGroup(component: Component, value: Node) {
	const { parts } = flattenReference(value); // TODO handle cases involving computed member expressions
	const keypath = parts.join('.');

	// TODO handle contextual bindings — `keypath` should include unique ID of
	// each block that provides context
	let index = component.bindingGroups.indexOf(keypath);
	if (index === -1) {
		index = component.bindingGroups.length;
		component.bindingGroups.push(keypath);
	}

	return index;
}

function getEventHandler(
	binding: Binding,
	component: Component,
	block: Block,
	name: string,
	snippet: string,
	dependencies: Set<string>,
	value: string
) {
	const storeDependencies = [...dependencies].filter(prop => prop[0] === '$').map(prop => prop.slice(1));
	let dependenciesArray = [...dependencies].filter(prop => prop[0] !== '$');

	if (binding.isContextual) {
		const tail = binding.value.node.type === 'MemberExpression'
			? getTailSnippet(binding.value.node)
			: '';

		const head = block.bindings.get(name);

		return {
			usesContext: true,
			usesState: true,
			usesStore: storeDependencies.length > 0,
			mutation: `${head}${tail} = ${value};`,
			props: dependenciesArray.map(prop => `${prop}: ctx.${prop}`),
			storeProps: storeDependencies.map(prop => `${prop}: $.${prop}`)
		};
	}

	if (binding.value.node.type === 'MemberExpression') {
		// This is a little confusing, and should probably be tidied up
		// at some point. It addresses a tricky bug (#893), wherein
		// Svelte tries to `set()` a computed property, which throws an
		// error in dev mode. a) it's possible that we should be
		// replacing computations with *their* dependencies, and b)
		// we should probably populate `component.target.readonly` sooner so
		// that we don't have to do the `.some()` here
		dependenciesArray = dependenciesArray.filter(prop => !component.computations.some(computation => computation.key === prop));

		return {
			usesContext: false,
			usesState: true,
			usesStore: storeDependencies.length > 0,
			mutation: `${snippet} = ${value}`,
			props: dependenciesArray.map((prop: string) => `${prop}: ctx.${prop}`),
			storeProps: storeDependencies.map(prop => `${prop}: $.${prop}`)
		};
	}

	let props;
	let storeProps;

	if (name[0] === '$') {
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
	component: Component,
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
		const bindingGroup = getBindingGroup(component, binding.value.node);
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