import Binding from '../../../nodes/Binding';
import ElementWrapper from '.';
import { dimensions } from '../../../../utils/patterns';
import getObject from '../../../../utils/getObject';
import Block from '../../Block';
import Node from '../../../nodes/shared/Node';
import Renderer from '../../Renderer';
import flattenReference from '../../../../utils/flattenReference';
import getTailSnippet from '../../../../utils/getTailSnippet';

// TODO this should live in a specific binding
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
	handler: any; // TODO
	updateDom: string;
	initialUpdate: string;
	needsLock: boolean;
	updateCondition: string;

	constructor(block: Block, node: Binding, parent: ElementWrapper) {
		this.node = node;
		this.parent = parent;

		const { dependencies } = this.node.value;

		block.addDependencies(dependencies);

		// TODO does this also apply to e.g. `<input type='checkbox' bind:group='foo'>`?
		if (parent.node.name === 'select') {
			parent.selectBindingDependencies = dependencies;
			dependencies.forEach((prop: string) => {
				parent.renderer.component.indirectDependencies.set(prop, new Set());
			});
		}
	}

	isReadOnlyMediaAttribute() {
		return readOnlyMediaAttributes.has(this.node.name);
	}

	munge(block: Block) {
		const { parent } = this;
		const { renderer } = parent;

		const needsLock = (
			parent.node.name !== 'input' ||
			!/radio|checkbox|range|color/.test(parent.node.getStaticAttributeValue('type'))
		);

		const isReadOnly = (
			(parent.node.isMediaNode() && readOnlyMediaAttributes.has(this.node.name)) ||
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
			const indirectDependencies = renderer.component.indirectDependencies.get(prop);
			if (indirectDependencies) {
				indirectDependencies.forEach(indirectDependency => {
					dependencies.add(indirectDependency);
				});
			}
		});

		// view to model
		const valueFromDom = getValueFromDom(renderer, this.parent, this);
		const handler = getEventHandler(this, renderer, block, name, snippet, dependencies, valueFromDom);

		// model to view
		let updateDom = getDomUpdater(parent, this, snippet);
		let initialUpdate = updateDom;

		// special cases
		if (this.node.name === 'group') {
			const bindingGroup = getBindingGroup(renderer, this.node.value.node);

			block.builders.hydrate.addLine(
				`#component._bindingGroups[${bindingGroup}].push(${parent.var});`
			);

			block.builders.destroy.addLine(
				`#component._bindingGroups[${bindingGroup}].splice(#component._bindingGroups[${bindingGroup}].indexOf(${parent.var}), 1);`
			);
		}

		if (this.node.name === 'currentTime' || this.node.name === 'volume') {
			updateConditions.push(`!isNaN(${snippet})`);

			if (this.node.name === 'currentTime') initialUpdate = null;
		}

		if (this.node.name === 'paused') {
			// this is necessary to prevent audio restarting by itself
			const last = block.getUniqueName(`${parent.var}_is_paused`);
			block.addVariable(last, 'true');

			updateConditions.push(`${last} !== (${last} = ${snippet})`);
			updateDom = `${parent.var}[${last} ? "pause" : "play"]();`;
			initialUpdate = null;
		}

		// bind:offsetWidth and bind:offsetHeight
		if (dimensions.test(this.node.name)) {
			initialUpdate = null;
			updateDom = null;
		}

		const dependencyArray = [...this.node.value.dependencies]

		if (dependencyArray.length === 1) {
			updateConditions.push(`changed.${dependencyArray[0]}`)
		} else if (dependencyArray.length > 1) {
			updateConditions.push(
				`(${dependencyArray.map(prop => `changed.${prop}`).join(' || ')})`
			)
		}

		return {
			name: this.node.name,
			object: name,
			handler: handler,
			usesContext: handler.usesContext,
			updateDom: updateDom,
			initialUpdate: initialUpdate,
			needsLock: !isReadOnly && needsLock,
			updateCondition: updateConditions.length ? updateConditions.join(' && ') : undefined,
			isReadOnlyMediaAttribute: this.isReadOnlyMediaAttribute()
		};
	}
}

function getDomUpdater(
	element: ElementWrapper,
	binding: BindingWrapper,
	snippet: string
) {
	const { node } = element;

	if (binding.isReadOnlyMediaAttribute()) {
		return null;
	}

	if (node.name === 'select') {
		return node.getStaticAttributeValue('multiple') === true ?
			`@selectOptions(${element.var}, ${snippet})` :
			`@selectOption(${element.var}, ${snippet})`;
	}

	if (binding.node.name === 'group') {
		const type = node.getStaticAttributeValue('type');

		const condition = type === 'checkbox'
			? `~${snippet}.indexOf(${element.var}.__value)`
			: `${element.var}.__value === ${snippet}`;

		return `${element.var}.checked = ${condition};`
	}

	return `${element.var}.${binding.node.name} = ${snippet};`;
}

function getBindingGroup(renderer: Renderer, value: Node) {
	const { parts } = flattenReference(value); // TODO handle cases involving computed member expressions
	const keypath = parts.join('.');

	// TODO handle contextual bindings — `keypath` should include unique ID of
	// each block that provides context
	let index = renderer.bindingGroups.indexOf(keypath);
	if (index === -1) {
		index = renderer.bindingGroups.length;
		renderer.bindingGroups.push(keypath);
	}

	return index;
}

function getEventHandler(
	binding: BindingWrapper,
	renderer: Renderer,
	block: Block,
	name: string,
	snippet: string,
	dependencies: Set<string>,
	value: string
) {
	const storeDependencies = [...dependencies].filter(prop => prop[0] === '$').map(prop => prop.slice(1));
	let dependenciesArray = [...dependencies].filter(prop => prop[0] !== '$');

	if (binding.node.isContextual) {
		const tail = binding.node.value.node.type === 'MemberExpression'
			? getTailSnippet(binding.node.value.node)
			: '';

		const head = block.bindings.get(name);

		return {
			usesContext: true,
			usesState: true,
			usesStore: storeDependencies.length > 0,
			mutation: `${head()}${tail} = ${value};`,
			props: dependenciesArray.map(prop => `${prop}: ctx.${prop}`),
			storeProps: storeDependencies.map(prop => `${prop}: $.${prop}`)
		};
	}

	if (binding.node.value.node.type === 'MemberExpression') {
		// This is a little confusing, and should probably be tidied up
		// at some point. It addresses a tricky bug (#893), wherein
		// Svelte tries to `set()` a computed property, which throws an
		// error in dev mode. a) it's possible that we should be
		// replacing computations with *their* dependencies, and b)
		// we should probably populate `component.target.readonly` sooner so
		// that we don't have to do the `.some()` here
		dependenciesArray = dependenciesArray.filter(prop => !renderer.component.computations.some(computation => computation.key === prop));

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

function isComputed(node: Node) {
	while (node.type === 'MemberExpression') {
		if (node.computed) return true;
		node = node.object;
	}

	return false;
}

function getValueFromDom(
	renderer: Renderer,
	element: ElementWrapper,
	binding: BindingWrapper
) {
	const { node } = element;
	const { name } = binding.node;

	// <select bind:value='selected>
	if (node.name === 'select') {
		return node.getStaticAttributeValue('multiple') === true ?
			`@selectMultipleValue(${element.var})` :
			`@selectValue(${element.var})`;
	}

	const type = node.getStaticAttributeValue('type');

	// <input type='checkbox' bind:group='foo'>
	if (name === 'group') {
		const bindingGroup = getBindingGroup(renderer, binding.node.value.node);
		if (type === 'checkbox') {
			return `@getBindingGroupValue(#component._bindingGroups[${bindingGroup}])`;
		}

		return `${element.var}.__value`;
	}

	// <input type='range|number' bind:value>
	if (type === 'range' || type === 'number') {
		return `@toNumber(${element.var}.${name})`;
	}

	if ((name === 'buffered' || name === 'seekable' || name === 'played')) {
		return `@timeRangesToArray(${element.var}.${name})`
	}

	// everything else
	return `${element.var}.${name}`;
}

function isComputed(node: Node) {
	while (node.type === 'MemberExpression') {
		if (node.computed) return true;
		node = node.object;
	}

	return false;
}