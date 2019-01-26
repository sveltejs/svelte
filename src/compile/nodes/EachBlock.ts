import Node from './shared/Node';
import ElseBlock from './ElseBlock';
import Block from '../render-dom/Block';
import Expression from './shared/Expression';
import mapChildren from './shared/mapChildren';
import TemplateScope from './shared/TemplateScope';
import unpackDestructuring from '../../utils/unpackDestructuring';

export default class EachBlock extends Node {
	type: 'EachBlock';

	block: Block;
	expression: Expression;
	context_node: Node;

	iterations: string;
	index: string;
	context: string;
	key: Expression;
	scope: TemplateScope;
	contexts: Array<{ name: string, tail: string }>;
	hasAnimation: boolean;
	has_binding = false;

	children: Node[];
	else?: ElseBlock;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		this.expression = new Expression(component, this, scope, info.expression);
		this.context = info.context.name || 'each'; // TODO this is used to facilitate binding; currently fails with destructuring
		this.context_node = info.context;
		this.index = info.index;

		this.scope = scope.child();

		this.contexts = [];
		unpackDestructuring(this.contexts, info.context, '');

		this.contexts.forEach(context => {
			this.scope.add(context.key.name, this.expression.dependencies, this);
		});

		this.key = info.key
			? new Expression(component, this, this.scope, info.key)
			: null;

		if (this.index) {
			// index can only change if this is a keyed each block
			const dependencies = this.key ? this.expression.dependencies : [];
			this.scope.add(this.index, dependencies, this);
		}

		this.hasAnimation = false;

		this.children = mapChildren(component, this, this.scope, info.children);

		if (this.hasAnimation) {
			if (this.children.length !== 1) {
				const child = this.children.find(child => !!child.animation);
				component.error(child.animation, {
					code: `invalid-animation`,
					message: `An element that use the animate directive must be the sole child of a keyed each block`
				});
			}
		}

		this.warnIfEmptyBlock(); // TODO would be better if EachBlock, IfBlock etc extended an abstract Block class

		this.else = info.else
			? new ElseBlock(component, this, this.scope, info.else)
			: null;
	}
}
