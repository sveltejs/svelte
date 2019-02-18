import Node from './shared/Node';
import Block from '../render-dom/Block';
import mapChildren from './shared/mapChildren';
import TemplateScope from './shared/TemplateScope';

export default class ThenBlock extends Node {
	block: Block;
	scope: TemplateScope;
	children: Node[];

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		this.scope = scope.child();
		this.scope.add(parent.value, parent.expression.dependencies, this);
		this.children = mapChildren(component, parent, this.scope, info.children);

		this.warnIfEmptyBlock();
	}
}