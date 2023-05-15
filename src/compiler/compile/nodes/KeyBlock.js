import Expression from './shared/Expression.js';
import map_children from './shared/map_children.js';
import AbstractBlock from './shared/AbstractBlock.js';

/** @extends AbstractBlock<'KeyBlock'> */
export default class KeyBlock extends AbstractBlock {
	/** @type {import('./shared/Expression.js').default} */
	expression;

	/**
	 * @param {import('../Component.js').default} component
	 * @param {import('./shared/Node.js').default} parent
	 * @param {import('./shared/TemplateScope.js').default} scope
	 * @param {import('../../interfaces.js').TemplateNode} info
	 */
	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.cannot_use_innerhtml();
		this.not_static_content();
		this.expression = new Expression(component, this, scope, info.expression);
		this.children = map_children(component, this, scope, info.children);
		this.warn_if_empty_block();
	}
}
