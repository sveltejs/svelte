import ElementWrapper from '..';
import Block from '../../../Block';
import deindent from '../../../../../utils/deindent';
import Binding from '../../../../nodes/Binding';
import getObject from '../../../../../utils/getObject';
import Renderer from '../../../Renderer';
import getTailSnippet from '../../../../../utils/getTailSnippet';
import { Node } from '../../../../../interfaces';
import Element from '../../../../nodes/Element';
import flattenReference from '../../../../../utils/flattenReference';
import { dimensions } from '../../../../../utils/patterns';

// TODO this should live in a specific binding
const readOnlyMediaAttributes = new Set([
	'duration',
	'buffered',
	'seekable',
	'played'
]);

export default class BindingWrapper {
	element: ElementWrapper;
	binding: Binding;
	events: string[];

	usesStore: boolean;
	needsLock: boolean;
	lock: string;
	mutations: string[];
	props: Set<string>;
	storeProps: Set<string>;
	handlerName: string;

	object: string;
	// handler: Handler;
	updateDom: string;
	initialUpdate: string;
	updateCondition: string;
	isReadOnly: boolean;
	isReadOnlyMediaAttribute: boolean;

	constructor(element: ElementWrapper, binding: Binding) {
		this.element = element;
		this.binding = binding;

		element.cannotUseInnerHTML();

		this.isReadOnly = false;
		this.needsLock = false;
		this.events = [];
	}

	fromDom() {
		throw new Error(`TODO implement in subclass`);

		// <select bind:value='selected>
		if (this.element.node.name === 'select') {
			return this.element.node.getStaticAttributeValue('multiple') === true ?
				`@selectMultipleValue(${this.element.var})` :
				`@selectValue(${this.element.var})`;
		}

		const type = this.element.node.getStaticAttributeValue('type');

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

	toDom() {
		throw new Error(`TODO implement in subclass`);

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

	isReadOnlyMediaAttribute() {
		return false;
	}

	render(block: Block) {
		// const needsLock = (
		// 	parent.node.name !== 'input' ||
		// 	!/radio|checkbox|range|color/.test(parent.getStaticAttributeValue('type'))
		// );

		// const isReadOnly = (
		// 	(parent.isMediaNode() && readOnlyMediaAttributes.has(this.node.name)) ||
		// 	dimensions.test(this.node.name)
		// );

		const lock = this.needsLock ?
			block.getUniqueName(`${this.element.var}_updating`) :
			null;

		if (lock) block.addVariable(lock, 'false');

		const updateConditions: string[] = [];
		if (lock) updateConditions.push(`!${lock}`);

		const { name } = getObject(this.binding.value.node);
		const { snippet } = this.binding.value;

		// special case: if you have e.g. `<input type=checkbox bind:checked=selected.done>`
		// and `selected` is an object chosen with a <select>, then when `checked` changes,
		// we need to tell the component to update all the values `selected` might be
		// pointing to
		// TODO should this happen in preprocess?
		const dependencies = new Set(this.binding.value.dependencies);
		this.binding.value.dependencies.forEach((prop: string) => {
			const indirectDependencies = this.element.renderer.component.indirectDependencies.get(prop);
			if (indirectDependencies) {
				indirectDependencies.forEach(indirectDependency => {
					dependencies.add(indirectDependency);
				});
			}
		});

		// view to model
		const valueFromDom = this.fromDom();
		const handler = getEventHandler(this.binding, this.element.renderer, block, name, snippet, dependencies, valueFromDom);

		// model to view
		let updateDom = this.toDom();
		let initialUpdate = updateDom;

		if (this.binding.name === 'currentTime' || this.binding.name === 'volume') {
			updateConditions.push(`!isNaN(${snippet})`);

			if (this.binding.name === 'currentTime') initialUpdate = null;
		}

		if (this.binding.name === 'paused') {
			// this is necessary to prevent audio restarting by itself
			const last = block.getUniqueName(`${this.element.var}_is_paused`);
			block.addVariable(last, 'true');

			updateConditions.push(`${last} !== (${last} = ${snippet})`);
			updateDom = `${this.element.var}[${last} ? "pause" : "play"]();`;
			initialUpdate = null;
		}

		// bind:offsetWidth and bind:offsetHeight
		if (dimensions.test(this.binding.name)) {
			initialUpdate = null;
			updateDom = null;
		}

		const dependencyArray = [...this.binding.value.dependencies]

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
		this.needsLock = !this.isReadOnly && this.needsLock; // TODO ????
		this.updateCondition = updateConditions.length ? updateConditions.join(' && ') : undefined;
		this.isReadOnlyMediaAttribute = readOnlyMediaAttributes.has(this.binding.name);

		let animation_frame = null; // TODO media binding only

		this.handlerName = block.getUniqueName(`${this.element.var}_${this.events.join('_')}_handler`);

		block.builders.init.addBlock(deindent`
			function ${this.handlerName}() {
				${
					animation_frame && deindent`
						cancelAnimationFrame(${animation_frame});
						if (!${this.element.var}.paused) ${animation_frame} = requestAnimationFrame(${handler});`
				}
				${handler.usesStore && `var $ = #component.store.get();`}
				${this.needsLock && `${lock} = true;`}
				${handler.mutation}
				${handler.props.length > 0 && `#component.set({ ${handler.props.join(', ')} });`}
				${handler.storeProps.length > 0 && `#component.store.set({ ${handler.storeProps.join(', ')} });`}
				${this.needsLock && `${lock} = false;`}
			}
		`);

		block.builders.update.addLine(
			updateConditions.length ? `if (${updateConditions.join(' && ')}) ${this.updateDom}` : this.updateDom
		);

		this.events.forEach(name => {
			block.builders.hydrate.addLine(
				`@addListener(${this.element.var}, "${name}", ${this.handlerName});`
			);

			block.builders.destroy.addLine(
				`@removeListener(${this.element.var}, "${name}", ${this.handlerName});`
			);
		});
	}
}

function getEventHandler(
	binding: Binding,
	renderer: Renderer,
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
			mutation: `${head()}${tail} = ${value};`,
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

// function fromDom(
// 	renderer: Renderer,
// 	node: Element,
// 	binding: Binding
// ) {
// 	// <select bind:value='selected>
// 	if (node.name === 'select') {
// 		return node.getStaticAttributeValue('multiple') === true ?
// 			`@selectMultipleValue(${node.var})` :
// 			`@selectValue(${node.var})`;
// 	}

// 	const type = node.getStaticAttributeValue('type');

// 	// <input type='checkbox' bind:group='foo'>
// 	if (binding.name === 'group') {
// 		const bindingGroup = getBindingGroup(renderer, binding.value.node);
// 		if (type === 'checkbox') {
// 			return `@getBindingGroupValue(#component._bindingGroups[${bindingGroup}])`;
// 		}

// 		return `${node.var}.__value`;
// 	}

// 	// <input type='range|number' bind:value>
// 	if (type === 'range' || type === 'number') {
// 		return `@toNumber(${node.var}.${binding.name})`;
// 	}

// 	if ((binding.name === 'buffered' || binding.name === 'seekable' || binding.name === 'played')) {
// 		return `@timeRangesToArray(${node.var}.${binding.name})`
// 	}

// 	// everything else
// 	return `${node.var}.${binding.name}`;
// }

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