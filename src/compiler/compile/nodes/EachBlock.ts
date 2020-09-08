import ElseBlock from './ElseBlock';
import Expression from './shared/Expression';
import map_children from './shared/map_children';
import TemplateScope from './shared/TemplateScope';
import AbstractBlock from './shared/AbstractBlock';
import Element from './Element';
import { Context, unpack_destructuring } from './shared/Context';
import { Node } from 'estree';

export default class EachBlock extends AbstractBlock {
	type: 'EachBlock';

	expression: Expression;
	context_node: Node;

	iterations: string;
	index: string;
	context: string;
	key: Expression;
	scope: TemplateScope;
	contexts: Context[];
	has_animation: boolean;
	has_binding = false;
	has_index_binding = false;

	else?: ElseBlock;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		this.expression = new Expression(component, this, scope, info.expression);
		this.context = info.context.name || 'each'; // TODO this is used to facilitate binding; currently fails with destructuring
		this.context_node = info.context;
		this.index = info.index;

		this.scope = scope.child();

		this.contexts = [];
		unpack_destructuring(this.contexts, info.context, node => node);

		this.contexts.forEach(context => {
			this.scope.add(context.key.name, this.expression.dependencies, this);
		});

		if (this.index) {
			// index can only change if this is a keyed each block
			const dependencies = info.key ? this.expression.dependencies : new Set([]);
			this.scope.add(this.index, dependencies, this);
		}

		this.key = info.key
			? new Expression(component, this, this.scope, info.key)
			: null;

		this.has_animation = false;

		this.children = map_children(component, this, this.scope, info.children);

		if (this.has_animation) {
			if (this.children.length !== 1) {
				const child = this.children.find(child => !!(child as Element).animation);
				component.error((child as Element).animation, {
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
