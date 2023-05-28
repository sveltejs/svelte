import map_children from './shared/map_children.js';
import AbstractBlock from './shared/AbstractBlock.js';

/** @extends AbstractBlock<'PendingBlock'> */
export default class PendingBlock extends AbstractBlock {
	/**
	 * @param {import('../Component.js').default} component
	 * @param {import('./shared/Node.js').default} parent
	 * @param {import('./shared/TemplateScope.js').default} scope
	 * @param {import('../../interfaces.js').TemplateNode} info
	 */
	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.children = map_children(component, parent, scope, info.children);
		if (!info.skip) {
			this.warn_if_empty_block();
		}
	}
}
