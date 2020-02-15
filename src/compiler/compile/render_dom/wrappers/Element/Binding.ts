import { b, x } from 'code-red';
import Binding from '../../../nodes/Binding';
import ElementWrapper from '../Element';
import get_object from '../../../utils/get_object';
import Block from '../../Block';
import Renderer from '../../Renderer';
import flatten_reference from '../../../utils/flatten_reference';
import EachBlock from '../../../nodes/EachBlock';
import { Node, Identifier } from 'estree';

export default class BindingWrapper {
	node: Binding;
	parent: ElementWrapper;

	object: string;
	handler: {
		uses_context: boolean;
		mutation: (Node | Node[]);
		contextual_dependencies: Set<string>;
		snippet?: Node;
	};
	snippet: Node;
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

		// view to model
		this.handler = get_event_handler(this, parent.renderer, block, this.object, this.node.raw_expression);

		this.snippet = this.node.expression.manipulate(block);

		this.is_readonly = this.node.is_readonly;

		this.needs_lock = this.node.name === 'currentTime' || (parent.node.name === 'input' && parent.node.get_static_attribute_value('type') === 'number'); // TODO others?
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
		return this.node.is_readonly_media_attribute();
	}

	render(block: Block, lock: Identifier) {
		if (this.is_readonly) return;

		const { parent } = this;

		const update_conditions: any[] = this.needs_lock ? [x`!${lock}`] : [];
		const mount_conditions: any[] = [];

		const dependency_array = [...this.node.expression.dependencies];

		if (dependency_array.length > 0) {
			update_conditions.push(block.renderer.dirty(dependency_array));
		}

		if (parent.node.name === 'input') {
			const type = parent.node.get_static_attribute_value('type');

			if (type === null || type === "" || type === "text" || type === "email" || type === "password") {
				update_conditions.push(x`${parent.var}.${this.node.name} !== ${this.snippet}`);
			}
		}

		// model to view
		let update_dom = get_dom_updater(parent, this);
		let mount_dom = update_dom;

		// special cases
		switch (this.node.name) {
			case 'group':
			{
				const binding_group = get_binding_group(parent.renderer, this.node.expression.node);

				block.renderer.add_to_context(`$$binding_groups`);
				const reference = block.renderer.reference(`$$binding_groups`);

				block.chunks.hydrate.push(
					b`${reference}[${binding_group}].push(${parent.var});`
				);

				block.chunks.destroy.push(
					b`${reference}[${binding_group}].splice(${reference}[${binding_group}].indexOf(${parent.var}), 1);`
				);
				break;
			}

			case 'textContent':
				update_conditions.push(x`${this.snippet} !== ${parent.var}.textContent`);
				mount_conditions.push(x`${this.snippet} !== void 0`);
				break;

			case 'innerHTML':
				update_conditions.push(x`${this.snippet} !== ${parent.var}.innerHTML`);
				mount_conditions.push(x`${this.snippet} !== void 0`);
				break;

			case 'currentTime':
				update_conditions.push(x`!@_isNaN(${this.snippet})`);
				mount_dom = null;
				break;

			case 'playbackRate':
			case 'volume':
				update_conditions.push(x`!@_isNaN(${this.snippet})`);
				mount_conditions.push(x`!@_isNaN(${this.snippet})`);
				break;

			case 'paused':
			{
				// this is necessary to prevent audio restarting by itself
				const last = block.get_unique_name(`${parent.var.name}_is_paused`);
				block.add_variable(last, x`true`);

				update_conditions.push(x`${last} !== (${last} = ${this.snippet})`);
				update_dom = b`${parent.var}[${last} ? "pause" : "play"]();`;
				mount_dom = null;
				break;
			}

			case 'value':
				if (parent.node.get_static_attribute_value('type') === 'file') {
					update_dom = null;
					mount_dom = null;
				}
		}

		if (update_dom) {
			if (update_conditions.length > 0) {
				const condition = update_conditions.reduce((lhs, rhs) => x`${lhs} && ${rhs}`);

				block.chunks.update.push(b`
					if (${condition}) {
						${update_dom}
					}
				`);
			} else {
				block.chunks.update.push(update_dom);
			}
		}

		if (mount_dom) {
			if (mount_conditions.length > 0) {
				const condition = mount_conditions.reduce((lhs, rhs) => x`${lhs} && ${rhs}`);

				block.chunks.mount.push(b`
					if (${condition}) {
						${mount_dom}
					}
				`);
			} else {
				block.chunks.mount.push(mount_dom);
			}
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
			b`@select_options(${element.var}, ${binding.snippet})` :
			b`@select_option(${element.var}, ${binding.snippet})`;
	}

	if (binding.node.name === 'group') {
		const type = node.get_static_attribute_value('type');

		const condition = type === 'checkbox'
			? x`~${binding.snippet}.indexOf(${element.var}.__value)`
			: x`${element.var}.__value === ${binding.snippet}`;

		return b`${element.var}.checked = ${condition};`;
	}

	if (binding.node.name === 'value') {
		return b`@set_input_value(${element.var}, ${binding.snippet});`;
	}

	return b`${element.var}.${binding.node.name} = ${binding.snippet};`;
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

function get_event_handler(
	binding: BindingWrapper,
	renderer: Renderer,
	block: Block,
	name: string,
	lhs: Node
): {
	uses_context: boolean;
	mutation: (Node | Node[]);
	contextual_dependencies: Set<string>;
	lhs?: Node;
} {
	const value = get_value_from_dom(renderer, binding.parent, binding);
	const contextual_dependencies = new Set(binding.node.expression.contextual_dependencies);

	const context = block.bindings.get(name);
	let set_store;

	if (context) {
		const { object, property, modifier, store } = context;

		if (lhs.type === 'Identifier') {
			lhs = modifier(x`${object}[${property}]`);

			contextual_dependencies.add(object.name);
			contextual_dependencies.add(property.name);
		}

		if (store) {
			set_store = b`${store}.set(${`$${store}`});`;
		}
	} else {
		const object = get_object(lhs);
		if (object.name[0] === '$') {
			const store = object.name.slice(1);
			set_store = b`${store}.set(${object.name});`;
		}
	}

	const mutation = b`
		${lhs} = ${value};
		${set_store}
	`;

	return {
		uses_context: binding.node.is_contextual || binding.node.expression.uses_context, // TODO this is messy
		mutation,
		contextual_dependencies
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
		return x`$$node`;
	}

	// <select bind:value='selected>
	if (node.name === 'select') {
		return node.get_static_attribute_value('multiple') === true ?
			x`@select_multiple_value(this)` :
			x`@select_value(this)`;
	}

	const type = node.get_static_attribute_value('type');

	// <input type='checkbox' bind:group='foo'>
	if (name === 'group') {
		const binding_group = get_binding_group(renderer, binding.node.expression.node);
		if (type === 'checkbox') {
			return x`@get_binding_group_value($$binding_groups[${binding_group}])`;
		}

		return x`this.__value`;
	}

	// <input type='range|number' bind:value>
	if (type === 'range' || type === 'number') {
		return x`@to_number(this.${name})`;
	}

	if ((name === 'buffered' || name === 'seekable' || name === 'played')) {
		return x`@time_ranges_to_array(this.${name})`;
	}

	// everything else
	return x`this.${name}`;
}
