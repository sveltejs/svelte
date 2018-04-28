import Node from './shared/Node';
import { DomGenerator } from '../dom/index';
import Generator from '../Generator';
import mapChildren from './shared/mapChildren';
import Block from '../dom/Block';
import TemplateScope from './shared/TemplateScope';

export default class Fragment extends Node {
	block: Block;
	children: Node[];
	scope: TemplateScope;

	constructor(compiler: Generator, info: any) {
		const scope = new TemplateScope();
		super(compiler, null, scope, info);

		this.scope = scope;
		this.children = mapChildren(compiler, this, scope, info.children);
	}

	init() {
		this.block = new Block({
			generator: this.compiler,
			name: '@create_main_fragment',
			key: null,

			indexNames: new Map(),
			listNames: new Map(),

			dependencies: new Set(),
		});

		this.compiler.blocks.push(this.block);
		this.initChildren(this.block, true, null);

		this.block.hasUpdateMethod = true;
	}

	build() {
		this.init();

		this.children.forEach(child => {
			child.build(this.block, null, 'nodes');
		});
	}
}