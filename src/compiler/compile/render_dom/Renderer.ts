import Block from './Block';
import { CompileOptions, Node, Identifier } from '../../interfaces';
import Component from '../Component';
import FragmentWrapper from './wrappers/Fragment';
import { x } from 'code-red';

export default class Renderer {
	component: Component; // TODO Maybe Renderer shouldn't know about Component?
	options: CompileOptions;

	blocks: Array<Block | string> = [];
	readonly: Set<string> = new Set();
	meta_bindings: Node[] = []; // initial values for e.g. window.innerWidth, if there's a <svelte:window> meta tag
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

		this.blocks.forEach(block => {
			if (typeof block !== 'string') {
				block.assign_variable_names();
			}
		});

		this.block.assign_variable_names();

		this.fragment.render(this.block, null, x`nodes` as unknown as Identifier);
	}
}
