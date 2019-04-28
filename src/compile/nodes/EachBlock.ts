import Node from './shared/Node';
import ElseBlock from './ElseBlock';
import Expression from './shared/Expression';
import map_children from './shared/map_children';
import TemplateScope from './shared/TemplateScope';
import AbstractBlock from './shared/AbstractBlock';
import { Node as INode } from '../../interfaces';

function unpack_destructuring(contexts: Array<{ name: string, tail: string }>, node: INode, tail: string) {
	if (!node) return;

	if (node.type === 'Identifier') {
		contexts.push({
			key: node,
			tail
		});
	} else if (node.type === 'ArrayPattern') {
		node.elements.forEach((element, i) => {
			unpack_destructuring(contexts, element, `${tail}[${i}]`);
		});
	} else if (node.type === 'ObjectPattern') {
		node.properties.forEach((property) => {
			unpack_destructuring(contexts, property.value, `${tail}.${property.key.name}`);
		});
	}
}

export default class EachBlock extends AbstractBlock {
	type: 'EachBlock';

	expression: Expression;
	context_node: Node;

	iterations: string;
	index: string;
	context: string;
	key: Expression;
	scope: TemplateScope;
	contexts: Array<{ name: string, tail: string }>;
	has_animation: boolean;
	has_binding = false;

	else?: ElseBlock;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		this.expression = new Expression(component, this, scope, info.expression);
		this.context = info.context.name || 'each'; // TODO this is used to facilitate binding; currently fails with destructuring
		this.context_node = info.context;
		this.index = info.index;

		this.scope = scope.child();

		this.contexts = [];
		unpack_destructuring(this.contexts, info.context, '');

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

		this.has_animation = false;

		this.children = map_children(component, this, this.scope, info.children);

		if (this.has_animation) {
			if (this.children.length !== 1) {
				const child = this.children.find(child => !!child.animation);
				component.error(child.animation, {
					code: `invalid-animation`,
					message: `An element that use the animate directive must be the sole child of a keyed each block`
				});
			}
		}

		this.warn_if_empty_block();

		this.else = info.else
			? new ElseBlock(component, this, this.scope, info.else)
			: null;
	}
}
