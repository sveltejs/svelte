import { b, x } from 'code-red';
import get_object from '../../../utils/get_object.js';
import replace_object from '../../../utils/replace_object.js';
import flatten_reference from '../../../utils/flatten_reference.js';
import add_to_set from '../../../utils/add_to_set.js';
import mark_each_block_bindings from '../shared/mark_each_block_bindings.js';
import handle_select_value_binding from './handle_select_value_binding.js';
import { regex_box_size } from '../../../../utils/patterns.js';
/** */
export default class BindingWrapper {
	/** @type {import('../../../nodes/Binding.js').default} */
	node = undefined;

	/** @type {import('./index.js').default | import('../InlineComponent/index.js').default} */
	parent = undefined;

	/** @type {string} */
	object = undefined;
	/**
	 * @type {{
	 * 		uses_context: boolean;
	 * 		mutation: import('estree').Node | import('estree').Node[];
	 * 		contextual_dependencies: Set<string>;
	 * 		lhs?: import('estree').Node;
	 * 	}}
	 */
	handler = undefined;

	/** @type {import('estree').Node} */
	snippet = undefined;

	/** @type {boolean} */
	is_readonly = undefined;

	/** @type {boolean} */
	needs_lock = undefined;

	/** @type {import('../../Renderer.js').BindingGroup} */
	binding_group = undefined;

	/**
	 * @param {import('../../Block.js').default} block
	 * @param {import('../../../nodes/Binding.js').default} node
	 * @param {import('./index.js').default | import('../InlineComponent/index.js').default} parent
	 */
	constructor(block, node, parent) {
		this.node = node;
		this.parent = parent;
		const { dependencies } = this.node.expression;
		block.add_dependencies(dependencies);
		// TODO does this also apply to e.g. `<input type='checkbox' bind:group='foo'>`?
		handle_select_value_binding(this, dependencies);
		if (node.is_contextual) {
			mark_each_block_bindings(this.parent, this.node);
		}
		this.object = get_object(this.node.expression.node).name;
		if (this.node.name === 'group') {
			this.binding_group = get_binding_group(parent.renderer, this, block);
		}
		// view to model
		this.handler = get_event_handler(
			this,
			parent.renderer,
			block,
			this.object,
			this.node.raw_expression
		);
		this.snippet = this.node.expression.manipulate(block);
		this.is_readonly = this.node.is_readonly;
		this.needs_lock = this.node.name === 'currentTime'; // TODO others?
	}
	get_dependencies() {
		const dependencies = new Set(this.node.expression.dependencies);
		this.node.expression.dependencies.forEach((prop) => {
			const indirect_dependencies = this.parent.renderer.component.indirect_dependencies.get(prop);
			if (indirect_dependencies) {
				indirect_dependencies.forEach((indirect_dependency) => {
					dependencies.add(indirect_dependency);
				});
			}
		});
		if (this.binding_group) {
			this.binding_group.list_dependencies.forEach((dep) => dependencies.add(dep));
		}
		return dependencies;
	}
	get_update_dependencies() {
		const object = this.object;
		const dependencies = new Set();
		if (this.node.expression.template_scope.names.has(object)) {
			this.node.expression.template_scope.dependencies_for_name
				.get(object)
				.forEach((name) => dependencies.add(name));
		} else {
			dependencies.add(object);
		}
		const result = new Set(dependencies);
		dependencies.forEach((dependency) => {
			const indirect_dependencies =
				this.parent.renderer.component.indirect_dependencies.get(dependency);
			if (indirect_dependencies) {
				indirect_dependencies.forEach((indirect_dependency) => {
					result.add(indirect_dependency);
				});
			}
		});
		return result;
	}
	is_readonly_media_attribute() {
		return this.node.is_readonly_media_attribute();
	}

	/**
	 * @param {import('../../Block.js').default} block
	 * @param {import('estree').Identifier} lock
	 */
	render(block, lock) {
		if (this.is_readonly) return;
		const { parent } = this;

		/** @type {any[]} */
		const update_conditions = this.needs_lock ? [x`!${lock}`] : [];

		/** @type {any[]} */
		const mount_conditions = [];

		/** @type {any} */
		let update_or_condition = null;
		const dependency_array = Array.from(this.get_dependencies());
		if (dependency_array.length > 0) {
			update_conditions.push(block.renderer.dirty(dependency_array));
		}
		if (parent.node.name === 'input') {
			const type = parent.node.get_static_attribute_value('type');
			if (
				type === null ||
				type === '' ||
				type === 'text' ||
				type === 'email' ||
				type === 'password' ||
				type === 'search' ||
				type === 'url'
			) {
				update_conditions.push(x`${parent.var}.${this.node.name} !== ${this.snippet}`);
			} else if (type === 'number') {
				update_conditions.push(x`@to_number(${parent.var}.${this.node.name}) !== ${this.snippet}`);
			}
		}
		// model to view
		let update_dom = get_dom_updater(parent, this, false);
		let mount_dom = get_dom_updater(parent, this, true);
		// special cases
		switch (this.node.name) {
			case 'group': {
				block.renderer.add_to_context('$$binding_groups');
				this.binding_group.add_element(block, this.parent.var);
				if (/** @type {import('./index.js').default} */ (this.parent).has_dynamic_value) {
					update_or_condition = /** @type {import('./index.js').default} */ (this.parent)
						.dynamic_value_condition;
				}
				break;
			}
			case 'textContent':
				update_conditions.push(x`${this.snippet} !== ${parent.var}.textContent`);
				mount_conditions.push(x`${this.snippet} !== void 0`);
				break;
			case 'innerText':
				update_conditions.push(x`${this.snippet} !== ${parent.var}.innerText`);
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
			case 'paused': {
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
				let condition = update_conditions.reduce((lhs, rhs) => x`${lhs} && ${rhs}`);
				if (update_or_condition) condition = x`${update_or_condition} || (${condition})`;
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

/**
 * @param {import('./index.js').default | import('../InlineComponent/index.js').default} element
 * @param {BindingWrapper} binding
 * @param {boolean} mounting
 */
function get_dom_updater(element, binding, mounting) {
	const { node } = element;
	if (binding.is_readonly_media_attribute()) {
		return null;
	}
	if (binding.node.name === 'this') {
		return null;
	}
	if (node.name === 'select') {
		return node.get_static_attribute_value('multiple') === true
			? b`@select_options(${element.var}, ${binding.snippet})`
			: mounting
			? b`@select_option(${element.var}, ${binding.snippet}, true)`
			: b`@select_option(${element.var}, ${binding.snippet})`;
	}
	if (binding.node.name === 'group') {
		const type = node.get_static_attribute_value('type');
		const condition =
			type === 'checkbox'
				? x`~(${binding.snippet} || []).indexOf(${element.var}.__value)`
				: x`${element.var}.__value === ${binding.snippet}`;
		return b`${element.var}.checked = ${condition};`;
	}
	if (binding.node.name === 'value') {
		return b`@set_input_value(${element.var}, ${binding.snippet});`;
	}
	return b`${element.var}.${binding.node.name} = ${binding.snippet};`;
}

/**
 * @param {import('../../Renderer.js').default} renderer
 * @param {BindingWrapper} binding
 * @param {import('../../Block.js').default} block
 */
function get_binding_group(renderer, binding, block) {
	const value = binding.node;
	const { parts } = flatten_reference(value.raw_expression);
	let keypath = parts.join('.');
	const contexts = [];
	const contextual_dependencies = new Set();
	const { template_scope } = value.expression;

	/** @param {string} dep */
	const add_contextual_dependency = (dep) => {
		contextual_dependencies.add(dep);
		const owner = template_scope.get_owner(dep);
		if (owner.type === 'EachBlock') {
			for (const dep of owner.expression.contextual_dependencies) {
				add_contextual_dependency(dep);
			}
		}
	};
	for (const dep of value.expression.contextual_dependencies) {
		add_contextual_dependency(dep);
	}
	for (const dep of contextual_dependencies) {
		const context = block.bindings.get(dep);
		let key;
		let name;
		if (context) {
			key = context.object.name;
			name = context.property.name;
		} else {
			key = dep;
			name = dep;
		}
		keypath = `${key}@${keypath}`;
		contexts.push(name);
	}
	// create a global binding_group across blocks
	if (!renderer.binding_groups.has(keypath)) {
		const index = renderer.binding_groups.size;
		// the bind:group depends on the list in the {#each} block as well
		// as reordering (removing and adding back to the DOM) may affect the value
		const list_dependencies = new Set();
		let parent = value.parent;
		while (parent) {
			if (parent.type === 'EachBlock') {
				for (const dep of parent.expression.dynamic_dependencies()) {
					list_dependencies.add(dep);
				}
			}
			parent = parent.parent;
		}
		/**
		 * When using bind:group with logic blocks, the inputs with bind:group may be scattered across different blocks.
		 * This therefore keeps track of all the <input> elements that have the same bind:group within the same block.
		 */
		const elements = new Map();
		contexts.forEach((context) => {
			renderer.add_to_context(context, true);
		});
		renderer.binding_groups.set(keypath, {
			binding_group: () => {
				let obj = x`$$binding_groups[${index}]`;
				if (contexts.length > 0) {
					contexts.forEach((secondary_index) => {
						obj = x`${obj}[${secondary_index}]`;
					});
				}
				return obj;
			},
			contexts,
			list_dependencies,
			keypath,
			add_element(block, element) {
				if (!elements.has(block)) {
					elements.set(block, []);
				}
				elements.get(block).push(element);
			},
			render(block) {
				const local_name = block.get_unique_name('binding_group');
				const binding_group = block.renderer.reference('$$binding_groups');
				block.add_variable(local_name);
				if (contexts.length > 0) {
					const indexes = {
						type: 'ArrayExpression',
						elements: contexts.map((name) => block.renderer.reference(name))
					};
					block.chunks.init.push(
						b`${local_name} = @init_binding_group_dynamic(${binding_group}[${index}], ${indexes})`
					);
					block.chunks.update.push(
						b`if (${block.renderer.dirty(
							Array.from(list_dependencies)
						)}) ${local_name}.u(${indexes})`
					);
				} else {
					block.chunks.init.push(
						b`${local_name} = @init_binding_group(${binding_group}[${index}])`
					);
				}
				block.chunks.hydrate.push(b`${local_name}.p(${elements.get(block)})`);
				block.chunks.destroy.push(b`${local_name}.r()`);
			}
		});
	}
	// register the binding_group for the block
	const binding_group = renderer.binding_groups.get(keypath);
	block.binding_groups.add(binding_group);
	return binding_group;
}

/**
 * @param {BindingWrapper} binding
 * @param {import('../../Renderer.js').default} renderer
 * @param {import('../../Block.js').default} block
 * @param {string} name
 * @param {import('estree').Node} lhs
 * @returns {{ uses_context: boolean; mutation: import('estree').Node | import('estree').Node[]; contextual_dependencies: Set<string>; lhs?: import('estree').Node; }}
 */
function get_event_handler(binding, renderer, block, name, lhs) {
	const contextual_dependencies = new Set(binding.node.expression.contextual_dependencies);
	const context = block.bindings.get(name);

	/** @type {import('estree').Node[] | undefined} */
	let set_store;
	if (context) {
		const { object, property, store, snippet } = context;
		lhs = replace_object(lhs, snippet);
		contextual_dependencies.add(object.name);
		contextual_dependencies.add(property.name);
		contextual_dependencies.delete(name);
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
	const value = get_value_from_dom(renderer, binding.parent, binding, contextual_dependencies);
	const mutation = b`
		${lhs} = ${value};
		${set_store}
	`;
	return {
		uses_context: binding.node.is_contextual || binding.node.expression.uses_context,
		mutation,
		contextual_dependencies,
		lhs
	};
}

/**
 * @param {import('../../Renderer.js').default} _renderer
 * @param {import('./index.js').default | import('../InlineComponent/index.js').default} element
 * @param {BindingWrapper} binding
 * @param {Set<string>} contextual_dependencies
 */
function get_value_from_dom(_renderer, element, binding, contextual_dependencies) {
	const { node } = element;
	const { name } = binding.node;
	if (name === 'this') {
		return x`$$value`;
	}
	// <div bind:contentRect|contentBoxSize|borderBoxSize|devicePixelContentBoxSize>
	if (regex_box_size.test(name)) {
		return x`@ResizeObserverSingleton.entries.get(this)?.${name}`;
	}
	// <select bind:value='selected>
	if (node.name === 'select') {
		return node.get_static_attribute_value('multiple') === true
			? x`@select_multiple_value(this)`
			: x`@select_value(this)`;
	}
	const type = node.get_static_attribute_value('type');
	// <input type='checkbox' bind:group='foo'>
	if (name === 'group') {
		if (type === 'checkbox') {
			const { binding_group, contexts } = binding.binding_group;
			add_to_set(contextual_dependencies, contexts);
			return x`@get_binding_group_value(${binding_group()}, this.__value, this.checked)`;
		}
		return x`this.__value`;
	}
	// <input type='range|number' bind:value>
	if (type === 'range' || type === 'number') {
		return x`@to_number(this.${name})`;
	}
	if (name === 'buffered' || name === 'seekable' || name === 'played') {
		return x`@time_ranges_to_array(this.${name})`;
	}
	// everything else
	return x`this.${name}`;
}
