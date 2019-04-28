import map_children from './shared/map_children';
import TemplateScope from './shared/TemplateScope';
import AbstractBlock from './shared/AbstractBlock';

export default class CatchBlock extends AbstractBlock {
	scope: TemplateScope;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		this.scope = scope.child();
		this.scope.add(parent.error, parent.expression.dependencies, this);
		this.children = map_children(component, parent, this.scope, info.children);
		
		this.warn_if_empty_block();
	}
}
