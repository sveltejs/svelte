import Binding from '../../../nodes/Binding';
import ElementWrapper from '.';
import { dimensions } from '../../../../utils/patterns';
import getObject from '../../../../utils/getObject';
import Block from '../../Block';
import Node from '../../../nodes/shared/Node';
import Renderer from '../../Renderer';
import flattenReference from '../../../../utils/flattenReference';
import { get_tail } from '../../../../utils/get_tail_snippet';
import EachBlock from '../../../nodes/EachBlock';

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
	handler: {
		usesContext: boolean;
		mutation: string;
		contextual_dependencies: Set<string>,
		snippet?: string
	};
	snippet: string;
	initialUpdate: string;
	isReadOnly: boolean;
	needsLock: boolean;

	constructor(block: Block, node: Binding, parent: ElementWrapper) {
		this.node = node;
		this.parent = parent;

		const { dependencies } = this.node.expression;

		block.addDependencies(dependencies);

		// TODO does this also apply to e.g. `<input type='checkbox' bind:group='foo'>`?
		if (parent.node.name === 'select') {
			parent.selectBindingDependencies = dependencies;
			dependencies.forEach((prop: string) => {
				parent.renderer.component.indirectDependencies.set(prop, new Set());
			});
		}

		if (node.isContextual) {
			// we need to ensure that the each block creates a context including
			// the list and the index, if they're not otherwise referenced
			const { name } = getObject(this.node.expression.node);
			const eachBlock = this.parent.node.scope.getOwner(name);

			(eachBlock as EachBlock).has_binding = true;
		}

		this.object = getObject(this.node.expression.node).name;

		// TODO unfortunate code is necessary because we need to use `ctx`
		// inside the fragment, but not inside the <script>
		const contextless_snippet = this.parent.renderer.component.source.slice(this.node.expression.node.start, this.node.expression.node.end);

		// view to model
		this.handler = getEventHandler(this, parent.renderer, block, this.object, contextless_snippet);

		this.snippet = this.node.expression.render(block);

		const type = parent.node.getStaticAttributeValue('type');

		this.isReadOnly = (
			dimensions.test(this.node.name) ||
			(parent.node.isMediaNode() && readOnlyMediaAttributes.has(this.node.name)) ||
			(parent.node.name === 'input' && type === 'file') // TODO others?
		);

		this.needsLock = this.node.name === 'currentTime'; // TODO others?
	}

	get_dependencies() {
		const dependencies = new Set(this.node.expression.dependencies);

		this.node.expression.dependencies.forEach((prop: string) => {
			const indirectDependencies = this.parent.renderer.component.indirectDependencies.get(prop);
			if (indirectDependencies) {
				indirectDependencies.forEach(indirectDependency => {
					dependencies.add(indirectDependency);
				});
			}
		});

		return dependencies;
	}

	isReadOnlyMediaAttribute() {
		return readOnlyMediaAttributes.has(this.node.name);
	}

	render(block: Block, lock: string) {
		if (this.isReadOnly) return;

		const { parent } = this;

		let updateConditions: string[] = this.needsLock ? [`!${lock}`] : [];

		const dependencyArray = [...this.node.expression.dependencies]

		if (dependencyArray.length === 1) {
			updateConditions.push(`changed.${dependencyArray[0]}`)
		} else if (dependencyArray.length > 1) {
			updateConditions.push(
				`(${dependencyArray.map(prop => `changed.${prop}`).join(' || ')})`
			)
		}

		// model to view
		let updateDom = getDomUpdater(parent, this);

		// special cases
		switch (this.node.name) {
			case 'group':
				const bindingGroup = getBindingGroup(parent.renderer, this.node.expression.node);

				block.builders.hydrate.addLine(
					`ctx.$$binding_groups[${bindingGroup}].push(${parent.var});`
				);

				block.builders.destroy.addLine(
					`ctx.$$binding_groups[${bindingGroup}].splice(ctx.$$binding_groups[${bindingGroup}].indexOf(${parent.var}), 1);`
				);
				break;

			case 'currentTime':
			case 'volume':
				updateConditions.push(`!isNaN(${this.snippet})`);
				break;

			case 'paused':
				// this is necessary to prevent audio restarting by itself
				const last = block.getUniqueName(`${parent.var}_is_paused`);
				block.addVariable(last, 'true');

				updateConditions.push(`${last} !== (${last} = ${this.snippet})`);
				updateDom = `${parent.var}[${last} ? "pause" : "play"]();`;
				break;

			case 'value':
				if (parent.getStaticAttributeValue('type') === 'file') {
					updateDom = null;
				}
		}

		if (updateDom) {
			block.builders.update.addLine(
				updateConditions.length ? `if (${updateConditions.join(' && ')}) ${updateDom}` : updateDom
			);
		}

		if (!/(currentTime|paused)/.test(this.node.name)) {
			block.builders.mount.addBlock(updateDom);
		}
	}
}

function getDomUpdater(
	element: ElementWrapper,
	binding: BindingWrapper
) {
	const { node } = element;

	if (binding.isReadOnlyMediaAttribute()) {
		return null;
	}

	if (binding.node.name === 'this') {
		return null;
	}

	if (node.name === 'select') {
		return node.getStaticAttributeValue('multiple') === true ?
			`@selectOptions(${element.var}, ${binding.snippet})` :
			`@selectOption(${element.var}, ${binding.snippet})`;
	}

	if (binding.node.name === 'group') {
		const type = node.getStaticAttributeValue('type');

		const condition = type === 'checkbox'
			? `~${binding.snippet}.indexOf(${element.var}.__value)`
			: `${element.var}.__value === ${binding.snippet}`;

		return `${element.var}.checked = ${condition};`
	}

	return `${element.var}.${binding.node.name} = ${binding.snippet};`;
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

function mutate_store(store, value, tail) {
	return tail
		? `${store}.update($$value => ($$value${tail} = ${value}, $$value));`
		: `${store}.set(${value});`;
}

function getEventHandler(
	binding: BindingWrapper,
	renderer: Renderer,
	block: Block,
	name: string,
	snippet: string
) {
	const value = getValueFromDom(renderer, binding.parent, binding);
	const store = binding.object[0] === '$' ? binding.object.slice(1) : null;

	let tail = '';
	if (binding.node.expression.node.type === 'MemberExpression') {
		const { start, end } = get_tail(binding.node.expression.node);
		tail = renderer.component.source.slice(start, end);
	}

	if (binding.node.isContextual) {
		const { object, property, snippet } = block.bindings.get(name);

		return {
			usesContext: true,
			mutation: store
				? mutate_store(store, value, tail)
				: `${snippet}${tail} = ${value};`,
			contextual_dependencies: new Set([object, property])
		};
	}

	const mutation = store
		? mutate_store(store, value, tail)
		: `${snippet} = ${value};`;

	if (binding.node.expression.node.type === 'MemberExpression') {
		return {
			usesContext: binding.node.expression.usesContext,
			mutation,
			contextual_dependencies: binding.node.expression.contextual_dependencies,
			snippet
		};
	}

	return {
		usesContext: false,
		mutation,
		contextual_dependencies: new Set()
	};
}

function getValueFromDom(
	renderer: Renderer,
	element: ElementWrapper,
	binding: BindingWrapper
) {
	const { node } = element;
	const { name } = binding.node;

	if (name === 'this') {
		return `$$node`;
	}

	// <select bind:value='selected>
	if (node.name === 'select') {
		return node.getStaticAttributeValue('multiple') === true ?
			`@selectMultipleValue(this)` :
			`@selectValue(this)`;
	}

	const type = node.getStaticAttributeValue('type');

	// <input type='checkbox' bind:group='foo'>
	if (name === 'group') {
		const bindingGroup = getBindingGroup(renderer, binding.node.expression.node);
		if (type === 'checkbox') {
			return `@getBindingGroupValue($$binding_groups[${bindingGroup}])`;
		}

		return `this.__value`;
	}

	// <input type='range|number' bind:value>
	if (type === 'range' || type === 'number') {
		return `@toNumber(this.${name})`;
	}

	if ((name === 'buffered' || name === 'seekable' || name === 'played')) {
		return `@timeRangesToArray(this.${name})`
	}

	// everything else
	return `this.${name}`;
}
