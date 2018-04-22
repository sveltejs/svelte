import Node from './shared/Node';
import { DomGenerator } from '../dom/index';
import Generator from '../Generator';
import mapChildren from './shared/mapChildren';
import Block from '../dom/Block';

export default class Fragment extends Node {
	block: Block;
	children: Node[];

	constructor(compiler: Generator, info: any) {
		super(compiler, info);
		this.children = mapChildren(compiler, this, info.children);
	}

	init() {
		this.block = new Block({
			generator: this.generator,
			name: '@create_main_fragment',
			key: null,

			contexts: new Map(),
			indexes: new Map(),
			changeableIndexes: new Map(),

			indexNames: new Map(),
			listNames: new Map(),

			dependencies: new Set(),
		});

		this.generator.blocks.push(this.block);
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