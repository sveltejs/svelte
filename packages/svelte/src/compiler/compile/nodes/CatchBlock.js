import AbstractBlock from './shared/AbstractBlock.js';
import get_const_tags from './shared/get_const_tags.js';

/** @extends AbstractBlock<'CatchBlock'> */
export default class CatchBlock extends AbstractBlock {
	/** @type {import('./shared/TemplateScope.js').default} */
	scope;

	/** @type {import('./ConstTag.js').default[]} */
	const_tags;

	/**
	 * @param {import('../Component.js').default} component
	 * @param {import('./AwaitBlock.js').default} parent
	 * @param {import('./shared/TemplateScope.js').default} scope
	 * @param {import('../../interfaces.js').TemplateNode} info
	 */
	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.scope = scope.child();
		if (parent.catch_node) {
			parent.catch_contexts.forEach((context) => {
				if (context.type !== 'DestructuredVariable') return;
				this.scope.add(context.key.name, parent.expression.dependencies, this);
			});
		}
		[this.const_tags, this.children] = get_const_tags(info.children, component, this, parent);
		if (!info.skip) {
			this.warn_if_empty_block();
		}
	}
}
