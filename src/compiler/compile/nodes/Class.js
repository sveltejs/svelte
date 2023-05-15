import Node from './shared/Node.js';
import Expression from './shared/Expression.js';

/** @extends Node<'Class'> */
export default class Class extends Node {
	/** @type {string} */
	name;

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
		this.name = info.name;
		this.expression = info.expression
			? new Expression(component, this, scope, info.expression)
			: null;
	}
}
