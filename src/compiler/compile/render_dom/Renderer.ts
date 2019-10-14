import Block from './Block';
import { CompileOptions } from '../../interfaces';
import Component from '../Component';
import FragmentWrapper from './wrappers/Fragment';
import { x } from 'code-red';
import { Node, Identifier } from 'estree';

export default class Renderer {
	component: Component; // TODO Maybe Renderer shouldn't know about Component?
	options: CompileOptions;

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
}
