import Binding from '../../../nodes/Binding';
import ElementWrapper from '.';
import { dimensions } from '../../../../utils/patterns';
import getObject from '../../../../utils/getObject';
import Block from '../../Block';
import Node from '../../../nodes/shared/Node';
import Renderer from '../../Renderer';
import flattenReference from '../../../../utils/flattenReference';
import { get_tail } from '../../../../utils/get_tail_snippet';

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

		const { dynamic_dependencies } = this.node.expression;

		block.addDependencies(dynamic_dependencies);

		// TODO does this also apply to e.g. `<input type='checkbox' bind:group='foo'>`?
		if (parent.node.name === 'select') {
			parent.selectBindingDependencies = dynamic_dependencies;
			dynamic_dependencies.forEach((prop: string) => {
				parent.renderer.component.indirectDependencies.set(prop, new Set());
			});
		}

		if (node.isContextual) {
			// we need to ensure that the each block creates a context including
			// the list and the index, if they're not otherwise referenced
			const { name } = getObject(this.node.expression.node);
			const eachBlock = block.contextOwners.get(name);

			eachBlock.hasBinding = true;
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

		const { name } = getObject(this.node.expression.node);

		const snippet = this.node.expression.render();

		// TODO unfortunate code is necessary because we need to use `ctx`
		// inside the fragment, but not inside the <script>
		const contextless_snippet = this.parent.renderer.component.source.slice(this.node.expression.node.start, this.node.expression.node.end);

		// special case: if you have e.g. `<input type=checkbox bind:checked=selected.done>`
		// and `selected` is an object chosen with a <select>, then when `checked` changes,
		// we need to tell the component to update all the values `selected` might be
		// pointing to
		// TODO should this happen in preprocess?
		const dependencies = new Set(this.node.expression.dependencies);

		this.node.expression.dependencies.forEach((prop: string) => {
			const indirectDependencies = renderer.component.indirectDependencies.get(prop);
			if (indirectDependencies) {
				indirectDependencies.forEach(indirectDependency => {
					dependencies.add(indirectDependency);
				});
			}
		});

		// view to model
		const valueFromDom = getValueFromDom(renderer, this.parent, this);
		const handler = getEventHandler(this, renderer, block, name, contextless_snippet, valueFromDom);

		// model to view
		let updateDom = getDomUpdater(parent, this, snippet);
		let initialUpdate = updateDom;

		// special cases
		if (this.node.name === 'group') {
			const bindingGroup = getBindingGroup(renderer, this.node.expression.node);

			block.builders.hydrate.addLine(
				`(#component.$$.binding_groups[${bindingGroup}] || (#component.$$.binding_groups[${bindingGroup}] = [])).push(${parent.var});`
			);

			block.builders.destroy.addLine(
				`#component.$$.binding_groups[${bindingGroup}].splice(#component.$$.binding_groups[${bindingGroup}].indexOf(${parent.var}), 1);`
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

		const dependencyArray = [...this.node.expression.dynamic_dependencies]

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
			handler,
			snippet,
			usesContext: handler.usesContext,
			updateDom: updateDom,
			initialUpdate: initialUpdate,
			needsLock: !isReadOnly && needsLock,
			updateCondition: updateConditions.length ? updateConditions.join(' && ') : undefined,
			isReadOnlyMediaAttribute: this.isReadOnlyMediaAttribute(),
			dependencies,
			contextual_dependencies: this.node.expression.contextual_dependencies
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

	if (binding.node.name === 'this') {
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
	value: string
) {
	if (binding.node.isContextual) {
		let tail = '';
		if (binding.node.expression.node.type === 'MemberExpression') {
			const { start, end } = get_tail(binding.node.expression.node);
			tail = renderer.component.source.slice(start, end);
		}

		const { object, property, snippet } = block.bindings.get(name)();

		return {
			usesContext: true,
			mutation: `${snippet}${tail} = ${value};`,
			contextual_dependencies: new Set([object, property])
		};
	}

	if (binding.node.expression.node.type === 'MemberExpression') {
		return {
			usesContext: false,
			mutation: `${snippet} = ${value};`,
			contextual_dependencies: new Set()
		};
	}

	return {
		usesContext: false,
		mutation: `${snippet} = ${value};`,
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
			return `@getBindingGroupValue($$self.$$.binding_groups[${bindingGroup}])`;
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