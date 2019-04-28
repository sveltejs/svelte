import map_children from './shared/map_children';
import AbstractBlock from './shared/AbstractBlock';

export default class PendingBlock extends AbstractBlock {

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.children = map_children(component, parent, scope, info.children);

		this.warn_if_empty_block();
	}
}
