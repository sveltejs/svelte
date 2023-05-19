import ElseBlock from './ElseBlock.js';
import Expression from './shared/Expression.js';
import AbstractBlock from './shared/AbstractBlock.js';
import get_const_tags from './shared/get_const_tags.js';

/** @extends AbstractBlock<'IfBlock'> */
export default class IfBlock extends AbstractBlock {
	/** @type {import('./shared/Expression.js').default} */
	expression;

	/** @type {import('./ElseBlock.js').default} */
	else;

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
		this.cannot_use_innerhtml();
		this.not_static_content();
		this.expression = new Expression(component, this, this.scope, info.expression);
		[this.const_tags, this.children] = get_const_tags(info.children, component, this, this);
		this.else = info.else ? new ElseBlock(component, this, scope, info.else) : null;
		this.warn_if_empty_block();
	}
}
