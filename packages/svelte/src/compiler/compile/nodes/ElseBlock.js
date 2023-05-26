import AbstractBlock from './shared/AbstractBlock.js';
import get_const_tags from './shared/get_const_tags.js';

/** @extends AbstractBlock<'ElseBlock'> */
export default class ElseBlock extends AbstractBlock {
	/** @type {import('./shared/TemplateScope.js').default} */
	scope;

	/** @type {import('./ConstTag.js').default[]} */
	const_tags;

	/**
	 * @param {import('../Component.js').default} component
	 * @param {import('./shared/Node.js').default} parent
	 * @param {import('./shared/TemplateScope.js').default} scope
	 * @param {import('../../interfaces.js').TemplateNode} info
	 */
	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.scope = scope.child();
		[this.const_tags, this.children] = get_const_tags(info.children, component, this, this);
		this.warn_if_empty_block();
	}
}
