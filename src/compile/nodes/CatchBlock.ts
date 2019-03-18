import Node from './shared/Node';
import Block from '../render-dom/Block';
import map_children from './shared/map_children';
import TemplateScope from './shared/TemplateScope';

export default class CatchBlock extends Node {
	block: Block;
	scope: TemplateScope;
	children: Node[];

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		this.scope = scope.child();
		this.scope.add(parent.error, parent.expression.dependencies, this);
		this.children = map_children(component, parent, this.scope, info.children);

		this.warn_if_empty_block();
	}
}