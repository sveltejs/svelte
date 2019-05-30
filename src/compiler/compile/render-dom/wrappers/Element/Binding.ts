import Binding from '../../../nodes/Binding';
import ElementWrapper from '../Element';
import { dimensions } from '../../../../utils/patterns';
import get_object from '../../../utils/get_object';
import Block from '../../Block';
import Node from '../../../nodes/shared/Node';
import Renderer from '../../Renderer';
import flatten_reference from '../../../utils/flatten_reference';
import EachBlock from '../../../nodes/EachBlock';
import { Node as INode } from '../../../../interfaces';

function get_tail(node: INode) {
	const end = node.end;
	while (node.type === 'MemberExpression') node = node.object;
	return { start: node.end, end };
}

export default class BindingWrapper {
	node: Binding;
	parent: ElementWrapper;

	object: string;
	handler: {
		uses_context: boolean;
		mutation: string;
		contextual_dependencies: Set<string>,
		snippet?: string
	};
	snippet: string;
	is_readonly: boolean;
	needs_lock: boolean;

	constructor(block: Block, node: Binding, parent: ElementWrapper) {
		this.node = node;
		this.parent = parent;

		const { dependencies } = this.node.expression;

		block.add_dependencies(dependencies);

		// TODO does this also apply to e.g. `<input type='checkbox' bind:group='foo'>`?
		if (parent.node.name === 'select') {
			parent.select_binding_dependencies = dependencies;
			dependencies.forEach((prop: string) => {
				parent.renderer.component.indirect_dependencies.set(prop, new Set());
			});
		}

		if (node.is_contextual) {
			// we need to ensure that the each block creates a context including
			// the list and the index, if they're not otherwise referenced
			const { name } = get_object(this.node.expression.node);
			const each_block = this.parent.node.scope.get_owner(name);

			(each_block as EachBlock).has_binding = true;
		}

		this.object = get_object(this.node.expression.node).name;

		// TODO unfortunate code is necessary because we need to use `ctx`
		// inside the fragment, but not inside the <script>
		const contextless_snippet = this.parent.renderer.component.source.slice(this.node.expression.node.start, this.node.expression.node.end);

		// view to model
		this.handler = get_event_handler(this, parent.renderer, block, this.object, contextless_snippet);

		this.snippet = this.node.expression.render(block);

		this.is_readonly = this.node.is_readonly;

		this.needs_lock = this.node.name === 'currentTime'; // TODO others?
	}

	get_dependencies() {
		const dependencies = new Set(this.node.expression.dependencies);

		this.node.expression.dependencies.forEach((prop: string) => {
			const indirect_dependencies = this.parent.renderer.component.indirect_dependencies.get(prop);
			if (indirect_dependencies) {
				indirect_dependencies.forEach(indirect_dependency => {
					dependencies.add(indirect_dependency);
				});
			}
		});

		return dependencies;
	}

	is_readonly_media_attribute() {
		return this.node.is_readonly_media_attribute()
	}

	render(block: Block, lock: string) {
		if (this.is_readonly) return;

		const { parent } = this;

		let update_conditions: string[] = this.needs_lock ? [`!${lock}`] : [];

		const dependency_array = [...this.node.expression.dependencies];

		if (dependency_array.length === 1) {
			update_conditions.push(`changed.${dependency_array[0]}`)
		} else if (dependency_array.length > 1) {
			update_conditions.push(
				`(${dependency_array.map(prop => `changed.${prop}`).join(' || ')})`
			)
		}

		if (parent.node.name === 'input') {
			const type = parent.node.get_static_attribute_value('type');

			if (type === null || type === "" || type === "text") {
				update_conditions.push(`(${parent.var}.${this.node.name} !== ${this.snippet})`)
			}
		}

		// model to view
		let update_dom = get_dom_updater(parent, this);

		// special cases
		switch (this.node.name) {
			case 'group':
				const binding_group = get_binding_group(parent.renderer, this.node.expression.node);

				block.builders.hydrate.add_line(
					`ctx.$$binding_groups[${binding_group}].push(${parent.var});`
				);

				block.builders.destroy.add_line(
					`ctx.$$binding_groups[${binding_group}].splice(ctx.$$binding_groups[${binding_group}].indexOf(${parent.var}), 1);`
				);
				break;

			case 'currentTime':
			case 'playbackRate':
			case 'volume':
				update_conditions.push(`!isNaN(${this.snippet})`);
				break;

			case 'paused':
				// this is necessary to prevent audio restarting by itself
				const last = block.get_unique_name(`${parent.var}_is_paused`);
				block.add_variable(last, 'true');

				update_conditions.push(`${last} !== (${last} = ${this.snippet})`);
				update_dom = `${parent.var}[${last} ? "pause" : "play"]();`;
				break;

			case 'value':
				if (parent.node.get_static_attribute_value('type') === 'file') {
					update_dom = null;
				}
		}

		if (update_dom) {
			block.builders.update.add_line(
				update_conditions.length ? `if (${update_conditions.join(' && ')}) ${update_dom}` : update_dom
			);
		}

		if (!/(currentTime|paused)/.test(this.node.name)) {
			block.builders.mount.add_block(update_dom);
		}
	}
}

function get_dom_updater(
	element: ElementWrapper,
	binding: BindingWrapper
) {
	const { node } = element;

	if (binding.is_readonly_media_attribute()) {
		return null;
	}

	if (binding.node.name === 'this') {
		return null;
	}

	if (node.name === 'select') {
		return node.get_static_attribute_value('multiple') === true ?
			`@select_options(${element.var}, ${binding.snippet})` :
			`@select_option(${element.var}, ${binding.snippet})`;
	}

	if (binding.node.name === 'group') {
		const type = node.get_static_attribute_value('type');

		const condition = type === 'checkbox'
			? `~${binding.snippet}.indexOf(${element.var}.__value)`
			: `${element.var}.__value === ${binding.snippet}`;

		return `${element.var}.checked = ${condition};`
	}

	return `${element.var}.${binding.node.name} = ${binding.snippet};`;
}

function get_binding_group(renderer: Renderer, value: Node) {
	const { parts } = flatten_reference(value); // TODO handle cases involving computed member expressions
	const keypath = parts.join('.');

	// TODO handle contextual bindings — `keypath` should include unique ID of
	// each block that provides context
	let index = renderer.binding_groups.indexOf(keypath);
	if (index === -1) {
		index = renderer.binding_groups.length;
		renderer.binding_groups.push(keypath);
	}

	return index;
}

function mutate_store(store, value, tail) {
	return tail
		? `${store}.update($$value => ($$value${tail} = ${value}, $$value));`
		: `${store}.set(${value});`;
}

function get_event_handler(
	binding: BindingWrapper,
	renderer: Renderer,
	block: Block,
	name: string,
	snippet: string
) {
	const value = get_value_from_dom(renderer, binding.parent, binding);
	const store = binding.object[0] === '$' ? binding.object.slice(1) : null;

	let tail = '';
	if (binding.node.expression.node.type === 'MemberExpression') {
		const { start, end } = get_tail(binding.node.expression.node);
		tail = renderer.component.source.slice(start, end);
	}

	if (binding.node.is_contextual) {
		const { object, property, snippet } = block.bindings.get(name);

		return {
			uses_context: true,
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
			uses_context: binding.node.expression.uses_context,
			mutation,
			contextual_dependencies: binding.node.expression.contextual_dependencies,
			snippet
		};
	}

	return {
		uses_context: false,
		mutation,
		contextual_dependencies: new Set()
	};
}

function get_value_from_dom(
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
		return node.get_static_attribute_value('multiple') === true ?
			`@select_multiple_value(this)` :
			`@select_value(this)`;
	}

	const type = node.get_static_attribute_value('type');

	// <input type='checkbox' bind:group='foo'>
	if (name === 'group') {
		const binding_group = get_binding_group(renderer, binding.node.expression.node);
		if (type === 'checkbox') {
			return `@get_binding_group_value($$binding_groups[${binding_group}])`;
		}

		return `this.__value`;
	}

	// <input type='range|number' bind:value>
	if (type === 'range' || type === 'number') {
		return `@to_number(this.${name})`;
	}

	if ((name === 'buffered' || name === 'seekable' || name === 'played')) {
		return `@time_ranges_to_array(this.${name})`
	}

	// everything else
	return `this.${name}`;
}
