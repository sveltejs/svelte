import Expression from './shared/Expression';
import map_children from './shared/map_children';
import TemplateScope from './shared/TemplateScope';
import AbstractBlock from './shared/AbstractBlock';
import { Context, unpack_destructuring } from './shared/Context';
import { Node } from 'estree';

export default class WithBlock extends AbstractBlock {
	type: 'WithBlock';

	expression: Expression;
	context_node: Node;

	context: string;
	scope: TemplateScope;
	contexts: Context[];
	has_binding = false;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		this.expression = new Expression(component, this, scope, info.expression);
		this.context = info.context.name || 'with'; // TODO this is used to facilitate binding; currently fails with destructuring
		this.context_node = info.context;
		this.scope = scope.child();

		this.contexts = [];
		unpack_destructuring(this.contexts, info.context, node => node);

		this.contexts.forEach(context => {
			this.scope.add(context.key.name, this.expression.dependencies, this);
		});

		this.children = map_children(component, this, this.scope, info.children);

		this.warn_if_empty_block();
	}
}
