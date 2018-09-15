import Node from './shared/Node';
import Component from '../Component';
import mapChildren from './shared/mapChildren';
import Block from '../dom/Block';
import TemplateScope from './shared/TemplateScope';

export default class Fragment extends Node {
	block: Block;
	children: Node[];
	scope: TemplateScope;

	constructor(component: Component, info: any) {
		const scope = new TemplateScope();
		super(component, null, scope, info);

		this.scope = scope;
		this.children = mapChildren(component, this, scope, info.children);
	}

	init() {
		this.block = new Block({
			component: this.component,
			name: '@create_main_fragment',
			key: null,

			bindings: new Map(),

			dependencies: new Set(),
		});

		this.component.target.blocks.push(this.block);
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