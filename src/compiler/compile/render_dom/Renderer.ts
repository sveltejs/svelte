import Block from './Block';
import { CompileOptions } from '../../interfaces';
import Component from '../Component';
import FragmentWrapper from './wrappers/Fragment';
import { x } from 'code-red';
import { Node, Identifier } from 'estree';

export default class Renderer {
	component: Component; // TODO Maybe Renderer shouldn't know about Component?
	options: CompileOptions;

	context: string[] = [];
	context_lookup: Map<string, number> = new Map();
	blocks: Array<Block | Node | Node[]> = [];
	readonly: Set<string> = new Set();
	meta_bindings: Array<Node | Node[]> = []; // initial values for e.g. window.innerWidth, if there's a <svelte:window> meta tag
	binding_groups: string[] = [];

	block: Block;
	fragment: FragmentWrapper;

	file_var: Identifier;
	locate: (c: number) => { line: number; column: number };

	constructor(component: Component, options: CompileOptions) {
		this.component = component;
		this.options = options;
		this.locate = component.locate; // TODO messy

		this.file_var = options.dev && this.component.get_unique_name('file');

		// TODO sort vars, most frequently referenced first?
		component.vars
			.filter(v => ((v.referenced || v.export_name) && !v.hoistable))
			.forEach(v => this.add_to_context(v.name));

		// ensure store values are included in context
		component.vars
			.filter(v => v.subscribable)
			.forEach(v => this.add_to_context(`$${v.name}`));

		if (component.var_lookup.has('$$props')) {
			this.add_to_context('$$props');
		}

		if (component.slots.size > 0) {
			this.add_to_context('$$slots');
			this.add_to_context('$$scope');
		}

		if (this.binding_groups.length > 0) {
			this.add_to_context('$$binding_groups');
		}

		// main block
		this.block = new Block({
			renderer: this,
			name: null,
			type: 'component',
			key: null,

			bindings: new Map(),

			dependencies: new Set(),
		});

		this.block.has_update_method = true;

		this.fragment = new FragmentWrapper(
			this,
			this.block,
			component.fragment.children,
			null,
			true,
			null
		);

		// TODO messy
		this.blocks.forEach(block => {
			if (block instanceof Block) {
				block.assign_variable_names();
			}
		});

		this.block.assign_variable_names();

		this.fragment.render(this.block, null, x`#nodes` as Identifier);
	}

	add_to_context(name: string, contextual = false) {
		if (!this.context_lookup.has(name)) {
			const i = this.context.length;

			this.context_lookup.set(name, i);
			this.context.push(contextual ? null : name);
		}

		return this.context_lookup.get(name);
	}

	invalidate(name: string, value?) {
		const variable = this.component.var_lookup.get(name);
		const i = this.context_lookup.get(name);

		if (variable && (variable.subscribable && (variable.reassigned || variable.export_name))) {
			return x`${`$$subscribe_${name}`}($$invalidate(${i}, ${value || name}))`;
		}

		if (name[0] === '$' && name[1] !== '$') {
			return x`${name.slice(1)}.set(${value || name})`;
		}

		if (
			variable &&
			!variable.referenced &&
			!variable.is_reactive_dependency &&
			!variable.export_name &&
			!name.startsWith('$$')
		) {
			return value || name;
		}

		if (value) {
			return x`$$invalidate(${i}, ${value})`;
		}

		// if this is a reactive declaration, invalidate dependencies recursively
		const deps = new Set([name]);

		deps.forEach(name => {
			const reactive_declarations = this.component.reactive_declarations.filter(x =>
				x.assignees.has(name)
			);
			reactive_declarations.forEach(declaration => {
				declaration.dependencies.forEach(name => {
					deps.add(name);
				});
			});
		});

		return Array.from(deps)
			.map(n => x`$$invalidate(${i}, ${n})`)
			.reduce((lhs, rhs) => x`${lhs}, ${rhs}}`);
	}

	get_bitmask(names) {
		return names.reduce((bits, name) => {
			const bit = 1 << this.context_lookup.get(name);
			return bits | bit;
		}, 0);
	}

	changed(names, is_reactive_declaration = false) {
		const bitmask = this.get_bitmask(names);

		return is_reactive_declaration
			? x`$$self.$$.dirty & ${bitmask}`
			: x`#changed & ${bitmask}`;
	}

	reference(name) {
		const i = this.context_lookup.get(name);

		if (name === `$$props`) return x`#ctx[${i}]`;

		let [head, ...tail] = name.split('.');

		const variable = this.component.var_lookup.get(head);

		// TODO this feels woolly. might encounter false positive
		// if each context shadows top-level var
		if (variable) {
			this.component.add_reference(name); // TODO we can probably remove most other occurrences of this

			if (!variable.hoistable) {
				head = x`#ctx[${i}]`;
			}
		} else {
			if (i === undefined) {
				throw new Error(`attempted to reference unknown value`);
			}

			head = x`#ctx[${i}]`;
		}

		return [head, ...tail].reduce((lhs, rhs) => x`${lhs}.${rhs}`);
	}
}
