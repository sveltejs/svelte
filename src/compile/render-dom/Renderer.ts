import Block from './Block';
import { CompileOptions } from '../../interfaces';
import Component from '../Component';
import FragmentWrapper from './wrappers/Fragment';
import CodeBuilder from '../../utils/CodeBuilder';

export default class Renderer {
	component: Component; // TODO Maybe Renderer shouldn't know about Component?
	options: CompileOptions;

	blocks: (Block | string)[];
	readonly: Set<string>;
	slots: Set<string>;
	metaBindings: CodeBuilder;
	bindingGroups: string[];

	block: Block;
	fragment: FragmentWrapper;

	fileVar: string;

	hasIntroTransitions: boolean;
	hasOutroTransitions: boolean;

	constructor(component: Component, options: CompileOptions) {
		this.component = component;
		this.options = options;
		this.locate = component.locate; // TODO messy

		this.readonly = new Set();
		this.slots = new Set();

		this.fileVar = options.dev && this.component.getUniqueName('file');

		// initial values for e.g. window.innerWidth, if there's a <svelte:window> meta tag
		this.metaBindings = new CodeBuilder();

		this.bindingGroups = [];

		// main block
		this.block = new Block({
			renderer: this,
			name: null,
			key: null,

			bindings: new Map(),
			contextOwners: new Map(),

			dependencies: new Set(),
		});

		this.block.hasUpdateMethod = true;
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
				block.assignVariableNames();
			}
		});

		this.block.assignVariableNames();

		this.fragment.render(this.block, null, 'nodes');
	}
}