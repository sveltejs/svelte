import Block from './Block';
import { CompileOptions } from '../../interfaces';
import Component from '../Component';
import FragmentWrapper from './wrappers/Fragment';
import CodeBuilder from '../utils/CodeBuilder';

export default class Renderer {
	component: Component; // TODO Maybe Renderer shouldn't know about Component?
	options: CompileOptions;

	blocks: (Block | string)[];
	readonly: Set<string>;
	slots: Set<string>;
	meta_bindings: CodeBuilder;
	binding_groups: string[];

	block: Block;
	fragment: FragmentWrapper;

	file_var: string;

	constructor(component: Component, options: CompileOptions) {
		this.component = component;
		this.options = options;
		this.locate = component.locate; // TODO messy

		this.readonly = new Set();
		this.slots = new Set();

		this.file_var = options.dev && this.component.get_unique_name('file');

		// initial values for e.g. window.innerWidth, if there's a <svelte:window> meta tag
		this.meta_bindings = new CodeBuilder();

		this.binding_groups = [];

		// main block
		this.block = new Block({
			renderer: this,
			name: null,
			key: null,

			bindings: new Map(),

			dependencies: new Set(),
		});

		this.block.has_update_method = true;
		this.blocks = [];

		this.fragment = new FragmentWrapper(
			this,
			this.block,
			component.fragment.children,
			null,
			true,
			null
		);

		this.blocks.forEach(block => {
			if (typeof block !== 'string') {
				block.assign_variable_names();
			}
		});

		this.block.assign_variable_names();

		this.fragment.render(this.block, null, 'nodes');
	}
}